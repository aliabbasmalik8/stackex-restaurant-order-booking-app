import { BranchDbService } from '@database/services/branch-db.service';
import { UserAddressDbService } from '@database/services/user-address-db.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** ~450m — well inside a typical 8km kitchen radius. */
const OFFSET_KM = 0.45;
const KM_PER_DEG_LAT = 111;

function parsePreviewFlag(raw: string | undefined): boolean {
  const value = raw?.trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
}

/**
 * Preview-only: give new testers a default pin near the first active branch
 * so checkout is already in delivery radius.
 */
@Injectable()
export class PreviewAddressSeedService {
  private readonly logger = new Logger(PreviewAddressSeedService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly branches: BranchDbService,
    private readonly addresses: UserAddressDbService,
  ) {}

  isEnabled(): boolean {
    return parsePreviewFlag(this.config.get<string>('IS_PUBLIC_PREVIEW_MODE'));
  }

  async seedForNewUser(userId: string): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const existing = await this.addresses.listByUserIdOrdered(userId);
      if (existing.length > 0) return;

      const branch = (await this.branches.listActiveOrdered()).find(
        (row) =>
          typeof row.lat === 'number' &&
          Number.isFinite(row.lat) &&
          typeof row.lng === 'number' &&
          Number.isFinite(row.lng),
      );
      if (!branch || branch.lat == null || branch.lng == null) {
        this.logger.warn(
          'Preview address seed skipped: no active branch with lat/lng',
        );
        return;
      }

      const radiusKm =
        typeof branch.delivery_radius_km === 'number' &&
        branch.delivery_radius_km > 0
          ? branch.delivery_radius_km
          : 8;
      const offsetKm = Math.min(OFFSET_KM, radiusKm * 0.25);
      const dLat = offsetKm / KM_PER_DEG_LAT;
      const cosLat = Math.cos((branch.lat * Math.PI) / 180);
      const dLng = offsetKm / (KM_PER_DEG_LAT * Math.max(Math.abs(cosLat), 0.2));

      await this.addresses.insertForUser(userId, {
        label: 'Home',
        line1: 'Preview test pin (near kitchen)',
        line2: '',
        area: branch.name,
        city: 'Dubai',
        notes: 'Seeded in preview mode — inside delivery radius.',
        lat: branch.lat + dLat,
        lng: branch.lng + dLng,
        isDefault: true,
        sortOrder: 0,
      });
    } catch (error) {
      this.logger.warn(
        `Preview address seed failed for user ${userId}: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
    }
  }
}
