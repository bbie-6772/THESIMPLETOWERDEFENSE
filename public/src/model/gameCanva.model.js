
let gameCanvas = {};


export const setGameCanvas = (left,top,width,height,Xscale,Yscale)=>{
    gameCanvas = {left,top,width,height,Xscale,Yscale};

}
export const getGameCanvas = ()=>{
    return gameCanvas;
}

export const getBaseImage = ()=>{
    return baseImage;
}