import React from 'react';
import { Hash as HashIcon, Italic as ItalicIcon } from 'react-feather';

export default ({ content, type }) => (
  <div>
    {type==='number' ? <HashIcon size={12} /> : <ItalicIcon size={12} />}
    {' '}
    {content}
  </div>
);
