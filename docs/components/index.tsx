import { L7Editor,L7EditorProps } from '@antv/l7-editor';
import React from 'react';
import './index.less';

// 定义所有需要传入的属性
const editorProps: L7EditorProps = {
  activeTab: 'geojson',
  toolbar: {
    dingTalk: false,
    help:false,
    setting:false,
    github:false,
    guide:false,
    import:false,
    download:false,
  }
};

export default () => {
  return (
    <div className="editor">
      <L7Editor {...editorProps} />
    </div>
  );
};
