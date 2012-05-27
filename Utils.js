Life.Utils = {};

Life.Utils.cap = function(x){
    if(x<0) return 0;
    if(x>1) return 1;
    return x;
};

Life.Utils.randomNormal = function(mean, sigma){
    return Math.round(((Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1)) * sigma + mean);
}

Life.Utils.rgbaToCss = function(r, g, b, a){
    return "rgba("+ Math.floor(r * 255) +","+ Math.floor(g * 255) +","+ Math.floor(b * 255) +", "+a+")";
}