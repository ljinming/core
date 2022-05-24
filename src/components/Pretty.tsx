import React, { useEffect } from 'react';
import './style.css';

interface propsFace {
  data?: any;
}
export default ({ data }: propsFace) => {
  useEffect(() => {}, [data]);

  function jsonShowFn(json: any) {
    if (!json.match('^{(.+:.+,*){1,}}$')) {
      //判断是否是json数据，不是直接返回
      return json;
    }

    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }

    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match: any) {
        var cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }

  return <pre id='jsonShow' dangerouslySetInnerHTML={{ __html: jsonShowFn(data) }}></pre>;
};
