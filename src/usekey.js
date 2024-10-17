import { useEffect } from "react";

export function UseKey(key, action) {
  useEffect(
    function () {
      function callback(e) {
        console.log("key pressed", e);

        if (e.code === key) {
          action();
        } else {
          console.log("not matched keypress");
        }
      }
      console.log("registered event", key);
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [key, action]
  );
}
