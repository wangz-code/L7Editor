import { CanvasLayer, GeometryLayer, PointLayer, PolygonLayer } from '@antv/l7'
import { useAsyncEffect, useUpdateEffect } from 'ahooks'
import { ConfigProvider, theme as antdTheme, message } from 'antd'
import classNames from 'classnames'
import localforage from 'localforage'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AppHeader,
  AppMap,
  LayerContextmenuPopup,
  LayerList,
  LayerPopup,
  MapContent,
  MapControlGroup,
  ResizePanel,
} from '../../components'
import { LocalStorageKey } from '../../constants'
import { LangList } from '../../locales'
import { useFeature, useGlobal } from '../../recoil'
import type { L7EditorProps } from '../../types'
import useStyle from './styles'
import { createWestPolygon } from './person'
import { zip } from 'lodash'

type EditorProps = L7EditorProps

export const Editor: React.FC<EditorProps> = (props) => {
  const { onFeatureChange } = props
  const { i18n, t } = useTranslation()
  const { theme, mapOptions, setMapOptions, locale } = useGlobal()
  const styles = useStyle()
  const { saveEditorText, bboxAutoFit, scene } = useFeature()

  useUpdateEffect(() => {
    if (theme === 'dark') {
      setMapOptions({ ...mapOptions, style: 'dark' })
    } else {
      setMapOptions({ ...mapOptions, style: 'normal' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  useEffect(() => {
    i18n.changeLanguage(locale)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const antdLocale = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    () => LangList.find((lang) => lang.lang === locale)?.antd!,
    [locale],
  )

  useAsyncEffect(async () => {
    const newEditorText = (await localforage.getItem(
      LocalStorageKey.EditorText,
    )) as string | null
    if (newEditorText && scene && !props.features) {
      try {
        const newFeatures = JSON.parse(newEditorText).features
        bboxAutoFit(newFeatures)
      } catch (error) {
        message.error(t('import_btn.file_upload.qingJianChaShuJu'))
      }
    } else if (scene && props.features) {
      bboxAutoFit()
    }
  }, [scene])

  useAsyncEffect(async () => {
    const newEditorText = (await localforage.getItem(
      LocalStorageKey.EditorText,
    )) as string | null
    if (newEditorText && !props.features) {
      saveEditorText(newEditorText)
    }
    setMapOptions({ ...mapOptions, maxZoom: 19 })
  }, [])

  function createFloorTexture(
    floorText: string,
    bgColor: string = 'rgba(0, 50, 120, 0.7)',
    size = 256,
  ): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio

    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    // 1. 绘制背景
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)

    // 2. 文字样式
    const fontSize = size * 0.4
    ctx.font = `bold ${fontSize}px "Microsoft YaHei", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 文字描边，防止浅色文字看不清
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 4
    ctx.strokeText(floorText, size / 2, size / 2)

    // 填充文字
    ctx.fillStyle = '#ffffff'
    ctx.fillText(floorText, size / 2, size / 2)

    return canvas.toDataURL('image/png')
  }

  const colorLib = [
    // 中性色（通用、无强调）
    'rgba(102, 117, 133, 0.85)', // 浅灰蓝
    'rgba(153, 167, 181, 0.85)', // 浅灰
    'rgba(229, 231, 235, 0.9)', // 超浅灰（接近白）
    // 蓝色系（信息、链接、信任）
    'rgba(72, 187, 255, 0.85)', // 浅天蓝
    'rgba(96, 165, 250, 0.85)', // 浅蓝
    'rgba(129, 140, 248, 0.85)', // 靛蓝
    // 绿色系（成功、健康）
    'rgba(74, 222, 128, 0.85)', // 浅绿
    'rgba(134, 239, 172, 0.85)', // 薄荷绿
    'rgba(167, 243, 208, 0.85)', // 淡绿
    // 橙色系（警告、活力、提醒）
    'rgba(251, 146, 60, 0.85)', // 浅橙
    'rgba(252, 165, 165, 0.85)', // 浅珊瑚橙
    'rgba(253, 186, 116, 0.85)', // 淡橙
    // 紫色系（创意、高端、特殊）
    'rgba(192, 132, 252, 0.85)', // 浅紫
    'rgba(216, 180, 254, 0.85)', // 淡紫
    'rgba(232, 121, 249, 0.85)', // 浅粉紫
  ]

  const genFLoor = async () => {
    if (!scene) return

    const usedColors = new Set() // 避免同一图层颜色重复
    const randomColor = () => {
      const availableColors = colorLib.filter((color) => !usedColors.has(color))
      if (availableColors.length === 0) usedColors.clear()
      const randomColor =
        availableColors[Math.floor(Math.random() * availableColors.length)]
      usedColors.add(randomColor)
      return randomColor
    }
    function randomName() {
      // 30个商场高频品牌库（服装12个+手机8个+食品10个）
      const brandLibrary = [
        // 服装类
        '海澜之家',
        '森马',
        '无印良品',
        '优衣库',
        'ZARA',
        'H&M',
        '太平鸟',
        '李宁',
        '安踏',
        'only',
        'veromoda',
        '杰克琼斯',
        '苹果',
        '华为',
        '小米',
        'OPPO',
        'vivo',
        '荣耀',
        '三星',
        '魅族',
        '三只松鼠',
        '良品铺子',
        '来伊份',
        '恰恰',
        '徐福记',
        '奥利奥',
        '乐事',
        '旺旺',
        '康师傅',
        '统一',
      ]

      // 生成0~29之间的随机索引，返回对应品牌
      const randomIndex = Math.floor(Math.random() * brandLibrary.length)
      return brandLibrary[randomIndex]
    }

    const map = scene.getMapService()
    const newEditorText = (await localforage.getItem(
      LocalStorageKey.EditorText,
    )) as string | null
    const data = JSON.parse(newEditorText || '')

    console.log('data log==>', data)
    const polygonLayers = []
    data.features.forEach((item) => {
      item.properties.color = randomColor()
      item.properties.name = randomName()
    })

    const f = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    f.forEach((i) => {
      const floorTex = createFloorTexture(`${i + 1}F`, randomColor())
      const fill_layer = new PolygonLayer({
        name: 'fill',
        zIndex: 3 + i,
      })
        .source(data)
        .shape('extrude')
        .color('color')
        .size(60)
        .style({
          heightfixed: true,
          raisingHeight: i * 300,
          // 顶面贴图，图片铺满多边形顶面（真正材质绑定顶面）
          mapTexture: floorTex,
        })
        .active(false)

      const text_layer = new PolygonLayer({
        name: 'text',
        zIndex: 3,
      })
        .source(data)
        .shape('name', 'text')
        .color('white')
        .size(13)
        .style({
          textAnchor: 'top',
          heightfixed: true,
          raisingHeight: i * 600,
        })
        .active(false)

      scene.addLayer(fill_layer)
      scene.addLayer(text_layer)

      polygonLayers.push([fill_layer])
    })

    const firstFeature = data.features[0]
    let westFeature = createWestPolygon(firstFeature, 0.00012) // 调整距离
    console.log('westFeature log==>', westFeature)

    const westLayer = new PolygonLayer({
      zIndex: 10,
    })
      .source({
        type: 'FeatureCollection',
        features: [westFeature],
      })

      .shape('fill')
      .color('#000000')
      .size(0.1)
      .shape('extrude')
      .style({
        mapTexture: '/images/dan.png',
        opacity: 1,
        heightfixed: true,
        // stroke / lineWidth-侧面边框颜色和宽度
        raisingHeight: 800, // 可选抬高
      })
      .active(true)
    const westLayerBg = new PolygonLayer({ zIndex: 9 })
      .source({
        type: 'FeatureCollection',
        features: [westFeature],
      })
      .shape('fill')
      .color('rgba(72, 187, 255, 0.85)')
      .size(0.1)
      .shape('extrude')
      .style({
        opacity: 1,
        heightfixed: true,
        raisingHeight: 800, // 可选抬高
      })
      .active(true)

    scene.addLayer(westLayer)
    scene.addLayer(westLayerBg)

    setInterval(() => {
      const h = Math.random() * 3000
      westLayer.style({
        raisingHeight: h,
      })
      westLayerBg.style({
        raisingHeight: h - 0.2,
      })
    }, 3000)
    map.setPitch(70)
    map.getCenter()
    // 隐藏底图底板
  }

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        algorithm:
          theme === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      <div
        className={classNames([styles.l7Editor, 'l7-editor'])}
        id="l7-editor"
      >
        <AppHeader toolbar={props.toolbar} onGenFloor={genFLoor} />
        <ResizePanel
          onFeatureChange={(e) => {
            if (onFeatureChange) {
              onFeatureChange(e)
            }
          }}
          left={
            <AppMap>
              <MapControlGroup mapControl={props.mapControl} />
              <LayerList />
              <LayerPopup />
              <LayerContextmenuPopup />
            </AppMap>
          }
          right={
            <MapContent tabItems={props?.tabItems} features={props?.features} />
          }
        />
      </div>
    </ConfigProvider>
  )
}
