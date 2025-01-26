export const addStyle = (css: string) => {
  const head = document.querySelector("head");
  if (!head) {
    return;
  }

  const style = document.createElement("style");
  head.append(style);

  style.append(`${css} \n`);
};
