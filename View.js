Life.View = function(parameters){

   var _this = this,
       _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement( 'canvas' ),
       _canvasWidth = parameters.width,
       _canvasHeight = parameters.height,
       _context = _canvas.getContext( '2d'),
       _world = parameters.world !== undefined ? parameters.world : new Life.World(parameters);

    _canvas.width = _canvasWidth;
    _canvas.height = _canvasHeight;

    this.canvas = _canvas;
    this.context = _context;

   this.animate = function(){
       requestAnimationFrame(_this.animate);
       _this.render();
   },

   this.render = function(){
      _context.clearRect(0,0,_canvasWidth,_canvasHeight);
      _world.draw(this, true);
   },

   this.renderAgent = function(agent){
       //Indicator
       _context.beginPath();
       _context.fillStyle = Life.Utils.rgbaToCss(agent.indicator.red, agent.indicator.green, agent.indicator.blue, 0.5);
       _context.arc(agent.pos.elements[0], agent.pos.elements[1], parameters.agent.size + Math.floor(agent.indicator.size), 0, 2 * Math.PI, false);
       _context.fill();


       //Eyes
       _context.strokeStyle = "rgba(60,60,60,1)";
       for(var i = 0; i < parameters.agent.numberEyes; i++){
           _context.beginPath();
           _context.moveTo(agent.pos.elements[0], agent.pos.elements[1]);
           var angle = agent.angle + agent.eyeDir[i];
           _context.lineTo(agent.pos.elements[0] + (parameters.agent.size * 2) * Math.cos(angle), agent.pos.elements[1] + (parameters.agent.size * 2) * Math.sin(angle));
           _context.stroke();
       }

       //Body
       _context.beginPath();
       _context.fillStyle = Life.Utils.rgbaToCss(agent.red, agent.green, agent.blue, 1);
       _context.arc(agent.pos.elements[0], agent.pos.elements[1], parameters.agent.size, 0, 2 * Math.PI, false);
       _context.fill();

       //Sprinting
       if(agent.sprinting){
           _context.strokeStyle = "rgba(200,0,0,1)";
       }else{
           _context.strokeStyle = "rgba(0,0,0,1)";
       }
       _context.stroke();


       //Spike
       _context.strokeStyle = "rgba(125,0,0,1)";
       _context.beginPath();
       _context.moveTo(agent.pos.elements[0], agent.pos.elements[1]);
       _context.lineTo(agent.pos.elements[0] + (parameters.agent.size * 3 * agent.spikeLength) * Math.cos(agent.angle), agent.pos.elements[1] + (parameters.agent.size * 3 * agent.spikeLength) * Math.sin(agent.angle));
       _context.stroke();


       //Stats offsets
       var xo = 18;
       var yo = -15;

       //Health
       _context.fillStyle = "black";
       _context.fillRect(agent.pos.elements[0] + xo, agent.pos.elements[1] + yo, 5, 40);
       _context.fillStyle = "rgba(0,200,0,1)";
       _context.fillRect(agent.pos.elements[0] + xo, agent.pos.elements[1] + yo + 20*(2-agent.health), 5,  40 - (20*(2-agent.health)));

   },

   this.drawFood = function(x, y, quantity){
       _context.fillStyle = Life.Utils.rgbaToCss(0.8, 1, 0.8, quantity);
       _context.fillRect(x*parameters.cellSize, y*parameters.cellSize, parameters.cellSize, parameters.cellSize);
   }

    this.animate();
};