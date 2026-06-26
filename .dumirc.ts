import CopyPlugin from 'copy-webpack-plugin'
import { defineConfig } from 'dumi'
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  apiParser: {},
  resolve: {
    // 配置入口文件路径，API 解析将从这里开始
    entryFile: './src/index.tsx',
  },
  title: 'L7 Editor - 基于 L7 的地理数据绘制工具',
  outputPath: 'docs-dist',
  copy: isProduction ? ['docs/CNAME'] : [],
  themeConfig: {
    name: 'L7 Editor',
    carrier: 'L7 Editor',
    pc: {
      primaryColor: '#1677ff',
      borderRadiusBase: '4px',
    },
    nav: [
      { title: '首页', link: '/' },
      { title: '指南', link: '/guide' },
      { title: 'API', link: '/docs' },
    ],
    footer: false,
  },
  metas: [
    {
      name: 'keywords',
      content:
        'L7, Map,GIS Data, GeoJSON, GIS, Editor, AntV, L7Editor, L7 Editor',
    },
    {
      name: 'description',
      content: 'A React tool for editing GIS data based on L7',
    },
  ],
  alias: {
    '@': require('path').resolve(__dirname, 'src'),
  },
  mfsu: false,
  logo: 'https://mdn.alipayobjects.com/huamei_k6sfo0/afts/img/A*gBeETo04y0IAAAAAAAAAAAAADjWqAQ/original',
  favicons: [
    'https://mdn.alipayobjects.com/huamei_k6sfo0/afts/img/A*gBeETo04y0IAAAAAAAAAAAAADjWqAQ/original',
  ],
  headScripts: [],
  chainWebpack: (config: any) => {
    config
      .plugin('monaco-editor')
      .use(MonacoEditorWebpackPlugin, [{ languages: ['json', 'javascript'] }])
      .end()
    config
      .plugin('CopyPlugin')
      .use(CopyPlugin, [
        {
          patterns: [
            {
              from: 'node_modules/onnxruntime-web/dist/*.wasm',
              to: '[name][ext]',
            },
          ],
        },
      ])
      .end()
    return config
  },
})
