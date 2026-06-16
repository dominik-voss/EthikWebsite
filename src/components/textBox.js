export function createText(text){


const box =
document.createElement("div");


box.className="textbox";

box.innerHTML=text;


return box;


}