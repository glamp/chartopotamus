import React from 'react';
import { ToggleLeft as ToggleLeftIcon, Calendar as CalendarIcon, Hash as HashIcon, Italic as ItalicIcon } from 'react-feather';

function getTypeIcon(type) {
  if (type==='number') {
    return <HashIcon size={12} />;
  }

  if (type==='date') {
    return <CalendarIcon size={12} />;
  }

  if (type==='boolean') {
    return <ToggleLeftIcon size={12} />;
  }

  return <ItalicIcon size={12} />;
}

export default ({ content, type }) => (
  <div>
    {getTypeIcon(type)}
    {' '}
    {content}
  </div>
);
