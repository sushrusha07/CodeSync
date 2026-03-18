import React, { useEffect, useRef, useImperativeHandle } from "react";
import { language, cmtheme } from "../../src/atoms";
import { useRecoilValue } from "recoil";
import ACTIONS from "../actions/Actions";

// CODE MIRROR
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";

// themes
import "codemirror/theme/material.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/dracula.css";
import "codemirror/theme/darcula.css";
import "codemirror/theme/gruvbox-dark.css";
import "codemirror/theme/oceanic-next.css";
import "codemirror/theme/solarized.css";
import "codemirror/theme/zenburn.css";

// modes
import "codemirror/mode/clike/clike";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/go/go";
import "codemirror/mode/rust/rust";
import "codemirror/mode/ruby/ruby";
import "codemirror/mode/swift/swift";
import "codemirror/mode/sql/sql";
import "codemirror/mode/xml/xml";
import "codemirror/mode/yaml/yaml";

// features
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/scroll/simplescrollbars.css";

// search
import "codemirror/addon/search/search.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/jump-to-line.js";
import "codemirror/addon/dialog/dialog.js";
import "codemirror/addon/dialog/dialog.css";

const Editor = React.forwardRef(({ socketRef, roomId, onCodeChange }, ref) => {
  const editorRef = useRef(null);
  const lang = useRecoilValue(language);
  const editorTheme = useRecoilValue(cmtheme);

  useImperativeHandle(ref, () => ({
    setCode: (code) => {
      editorRef.current.setValue(code);
    },
  }));

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: lang },
          theme: editorTheme,
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      // CODE CHANGE
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();

        onCodeChange(code);

        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });

      // CURSOR ACTIVITY
      editorRef.current.on("cursorActivity", (instance) => {
        const cursor = instance.getCursor();

        socketRef.current.emit(ACTIONS.CURSOR_POSITION, {
          roomId,
          cursor,
        });
      });
    }

    init();
  }, [lang]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setOption("theme", editorTheme);
    }
  }, [editorTheme]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });

      // RECEIVE CURSOR UPDATE
      socketRef.current.on(ACTIONS.CURSOR_UPDATE, ({ cursor }) => {
        console.log("Other user cursor:", cursor.line);
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
      socketRef.current.off(ACTIONS.CURSOR_UPDATE);
    };
  }, [socketRef.current]);

  return <textarea id="realtimeEditor"></textarea>;
});

export default Editor;