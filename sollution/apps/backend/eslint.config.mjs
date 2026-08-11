// @ts-check
/**
 * Adapted from native-builder-backend `eslint.config.mjs`,
 * plus DB-boundary enforcement for this template.
 */
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const dbBoundaryMessage =
  'DB access only via src/database/services/*-db.service.ts (see ai_instruction/database-services.md).';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'node_modules/**',
      'coverage/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  /**
   * Block TypeORM persistence APIs outside the allowlist below.
   * Entities may still import Column/Entity/etc. from 'typeorm'.
   */
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'typeorm',
              importNames: [
                'Repository',
                'DataSource',
                'EntityManager',
                'getRepository',
                'getManager',
                'getConnection',
              ],
              message: dbBoundaryMessage,
            },
            {
              name: '@nestjs/typeorm',
              importNames: [
                'InjectRepository',
                'InjectDataSource',
                'InjectEntityManager',
                'TypeOrmModule',
              ],
              message: dbBoundaryMessage,
            },
          ],
        },
      ],
    },
  },
  // Allowlist: only these paths may use Repository / TypeOrmModule / DataSource
  {
    files: [
      'src/database/services/**/*.ts',
      'src/database/database.module.ts',
      'src/modules/app.module.ts',
      'src/migrations/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
);
