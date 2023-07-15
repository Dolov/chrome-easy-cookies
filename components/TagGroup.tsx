import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Input, Tag } from 'antd';
import type { InputRef } from 'antd';
import { TweenOneGroup } from 'rc-tween-one';

const TagGroup: React.FC<{
  name: string
  data: string[]
  value: string
  onCreate: any
  onDelete: any
  onChange: any
}> = props => {
  const { onCreate, onDelete, name, value, data, onChange } = props
  const inputRef = useRef<InputRef>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputVisible, setInputVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!inputVisible) return
    inputRef.current?.focus()
  }, [inputVisible]);

  const onClick = (tag: string) => {
    onChange(name, tag)
  }

  const handleClose = (removedTag: string) => {
    onDelete(name, removedTag)
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && data.indexOf(inputValue) === -1) {
      onCreate(name, inputValue)
    }
    setInputValue('');
    setInputVisible(false);
  };

  const forMap = (tag: string) => {
    const checked = tag === value
    const icon = checked ? <CheckCircleOutlined />: null
    const color = checked ? 'success': undefined
    return (
      <span key={tag} style={{ display: 'inline-block' }}>
        <Tag
          closable
          icon={icon}
          style={{ cursor: 'pointer' }}
          color={color}
          onClick={() => onClick(tag)}
          onClose={e => {
            e.preventDefault();
            handleClose(tag);
          }}
        >
          {tag}
        </Tag>
      </span>
    );
  };

  const tagChild = data.map(forMap);

  return (
    <div>
      <TweenOneGroup
        style={{ marginBottom: 4 }}
        enter={{
          scale: 0.8,
          opacity: 0,
          type: 'from',
          duration: 100,
        }}
        onEnd={e => {
          if (e.type === 'appear' || e.type === 'enter') {
            (e.target as any).style = 'display: inline-block';
          }
        }}
        leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
        appear={false}
      >
        {tagChild}
      </TweenOneGroup>
      {inputVisible && (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={{ width: 78 }}
          value={inputValue}
          onBlur={handleInputConfirm}
          onChange={handleInputChange}
          onPressEnter={handleInputConfirm}
        />
      )}
      {!inputVisible && (
        <Tag onClick={showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
          <PlusOutlined /> New value
        </Tag>
      )}
    </div>
  );
};

export default TagGroup;