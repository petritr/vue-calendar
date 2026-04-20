import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { resolve } from 'node:path'

export default defineConfig(({ mode }) => {
  const isDemo = mode === 'demo'

  return {
    base: isDemo ? '/vue-calendar/' : '/',
    plugins: [
      vue(),
      ...(!isDemo
        ? [
            dts({
              insertTypesEntry: true,
              tsconfigPath: './tsconfig.json',
            }),
            cssInjectedByJsPlugin(),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: isDemo
      ? { outDir: 'demo-dist' }
      : {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'VueCalendar',
            formats: ['es', 'cjs'],
            fileName: 'index',
          },
          rollupOptions: {
            external: ['vue'],
            output: {
              globals: {
                vue: 'Vue',
              },
            },
          },
          cssCodeSplit: false,
        },
  }
})
