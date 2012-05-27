Life.World = function(parameters){

    var _this = this,
        idCounter = 0,
        modCounter = 0,
        ptr = 0,
        currentEpoch = 0,
        closed = false;

    this.agents = new Array();
    this.food = new Array();

    var numHerbivore = Array();
    var numCarnivore = Array();

    var foodWidth = Math.floor(parameters.width / parameters.cellSize);
    var foodHeight = Math.floor(parameters.height / parameters.cellSize);

    for(var x = 0; x < foodWidth; x++){
        _this.food[x] = new Array();
        for(var y = 0; y < foodHeight; y++){
            _this.food[x][y] = 0;
        }
    }

     this.addRandomBots = function(quantity){
        for(var i = 0; i < quantity; i++){
            var agent = new Life.Agent(parameters);
            agent.id = idCounter;
            idCounter++;
            _this.agents.push(agent);
        }
    },

    this.update = function(){
        modCounter++;



        for(var id in _this.agents){
            var agent = _this.agents[id];

            if(modCounter % 100 == 0){
                agent.age++;
            }

            if(modCounter % 1000){
                var herbCarn = _this.numHerbivoresCarnivores();
                numHerbivore[ptr] = herbCarn[0];
                numCarnivore[ptr] = herbCarn[1];
                ptr++;
                if(ptr == numHerbivore.length) ptr = 0;
            }

            if(modCounter >= 10000){
                modCounter = 0;
                currentEpoch++;
            }



            agent.spiked = false;
        }
            if(modCounter % parameters.foodAddFrequency == 0){
                var fx = Math.floor(Math.random() * foodWidth);
                var fy = Math.floor(Math.random() * foodHeight);
                _this.food[fx][fy] = parameters.maxFood;

                console.log(_this.agents[0]);
                console.log(_this.agents[_this.agents.length - 1]);
            }

            _this.setInputs();
            _this.brainsTick();
            _this.processOutputs();

        for(var id in _this.agents){
            var agent = _this.agents[id];

            var baseLoss = 0.0002;
            if(agent.sprinting){
                agent.health -= baseLoss * parameters.agent.sprintMultiplier * 1.3;
            }else{
                agent.health -= baseLoss;
            }

            var dd = 2 * Math.abs(agent.pos.elements[0]/parameters.width - 0.5);
            var discomfort = Math.abs(dd-agent.temperaturePreference);
            discomfort *= discomfort;
            if(discomfort < 0.08) discomfort = 0;
            agent.health -= parameters.agent.temperatureDiscomfortDamage * discomfort;

            if(agent.indicator.size > 0) agent.indicator.size--;

            if(agent.health <= 0 && agent.spiked){
                var numAround = 0;
                for(var id2 in _this.agents){
                    var agent2 = _this.agents[id2];
                    if(agent2.health > 0){
                        var d = agent.pos.subtract(agent2.pos).length;
                        if(d < parameters.agent.bodyDecayRadius){
                            numAround++;
                        }
                    }
                }

                var ageMultiplier = 1;
                if(agent.age < 5) ageMultiplier = agent.age * 0.2;

                if(numAround > 0){
                    for(var id2 in _this.agents){
                        var agent2 = _this.agents[id2];
                        if(agent2.health > 0){
                            var d = agent.pos.subtract(agent2.pos).length;
                            if(d < parameters.agent.bodyDecayRadius){
                                agent2.health += 5*(1-agent2.herbivore)*(1-agent2.herbivore)/Math.pow(numAround,1.25)*ageMultiplier;
                                agent2.repCounter -= parameters.agent.bodyFertilityBonus * (1-agent.herbivore) * (1-agent.herbivore) / Math.pow(numAround,1.25)*ageMultiplier;
                                if(agent2.health > 2) agent2.health = 2;
                                agent2.indicator = {
                                    size:30,
                                    red:1,
                                    green:1,
                                    blue:1
                                };
                            }
                        }
                    }
                }
            }

            if(agent.health <= 0){
                _this.agents.splice(id, 1);
            }

            if(agent.repCounter < 0 && agent.health > 0.65 && modCounter %15 == 0 && Math.random() < 0.1){
                _this.asexuallyReproduce(agent, agent.mutationRate[0], agent.mutationRate[1]);
                agent.repCounter = agent.herbivore * ((Math.random() * 0.2) + parameters.agent.reproductionRate.herbivore - 0.1)
                                    + (1-agent.herbivore) * ((Math.random() * 0.2) + parameters.agent.reproductionRate.carnivore - 0.1);
            }

            if(!closed){
                if(_this.agents.length < parameters.minAgents){
                    _this.addRandomBots(1);
                }
                if(modCounter%100 == 0 && _this.agents.length < parameters.maxAgents){
                    if(Math.random() < 0.5){
                        _this.addRandomBots(1);
                    }else{
                        _this.sexuallyReproduce();
                    }
                }
            }

        }

    },

    this.setInputs = function(){
        for(var id in _this.agents){
            var agent = _this.agents[id];

            //Eyes
            var p = [0,0,0,0];
            var r = [0,0,0,0];
            var g = [0,0,0,0];
            var b = [0,0,0,0];

            var soundAccum = 0;
            var smellAccum = 0;
            var hearingAccum = 0;

            var blood = 0;

            for(var id2 in _this.agents){
                if(id == id2) continue;
                var agent2 = _this.agents[id2];

                var dist = parameters.distance;
                if(agent.x<agent2.x-dist || agent.x>agent2.x+dist || agent.y>agent2.y+dist || agent.y<agent2.y-dist) continue;

                var d = agent.pos.distanceFrom(agent2);
                if(d< dist){
                    smellAccum += (dist - d)/dist;
                    soundAccum += (dist - d)/dist*(Math.max(Math.abs(agent2.wheel1),Math.abs(agent2.wheel2)));
                    hearingAccum += agent2.soundMultiplier*(dist-d)/dist;

                    var angle = agent2.pos.angleFrom(agent);

                    for(var eye = 0; eye < parameters.agent.numberEyes; eye++){
                        var aa = agent.angle + agent.eyeDir[eye];
                        if(aa < -Math.PI) aa += 2*Math.PI;
                        if(aa > Math.PI) aa -= 2* Math.PI;

                        var diff = aa - angle;
                        if(Math.abs(diff) > Math.PI) diff = 2 * Math.PI - Math.abs(diff);
                        diff = Math.abs(diff);

                        var fov = agent.eyeFov[eye];
                        if(diff < fov){
                            var mul = agent.eyeSenseModifier * (Math.abs(fov-dist)/fov) * ((dist - d)/dist);
                            p[eye] += mul * (d/dist);
                            r[eye] += mul * agent2.red;
                            g[eye] += mul * agent2.green;
                            b[eye] += mul * agent2.blue;
                        }
                    }

                    //Blood sensor
                    var forwardAngle = agent.angle;
                    var diff = forwardAngle - angle;
                    if(Math.abs(forwardAngle) > Math.PI) diff = 2* Math.PI - Math.abs(forwardAngle);
                    diff = Math.abs(diff);
                    var PI38 = (Math.PI /8 /2) * 3;
                    if(diff < PI38){
                        var mul = ((PI38-diff)/PI38)*((dist-d)/dist);
                        blood += mul * (1-agent2.health/2);
                    }
                }
            }

            smellAccum *= agent.smellModifier;
            soundAccum *= agent.soundModifier;
            hearingAccum *= agent.hearingModifier;
            blood *= agent.bloodModifier;

            var discomfort = Math.abs((2*Math.abs(agent.pos.elements[0] / parameters.width - 0.5)) - agent.temperaturePreference);
            var cx = Math.floor(agent.pos.elements[0]/parameters.cellSize);
            var cy = Math.floor(agent.pos.elements[1]/parameters.cellSize);
            var food = _this.food[cx][cy]/parameters.maxFood;


            agent.in = [
                Life.Utils.cap(p[0]),
                Life.Utils.cap(r[0]),
                Life.Utils.cap(g[0]),
                Life.Utils.cap(b[0]),

                food,

                Life.Utils.cap(p[1]),
                Life.Utils.cap(r[1]),
                Life.Utils.cap(g[1]),
                Life.Utils.cap(b[1]),

                Life.Utils.cap(soundAccum),
                Life.Utils.cap(smellAccum),
                Life.Utils.cap(agent.health / 2),

                Life.Utils.cap(p[2]),
                Life.Utils.cap(r[2]),
                Life.Utils.cap(g[2]),
                Life.Utils.cap(b[2]),

                Math.abs(Math.sin(modCounter/agent.clock1)),
                Math.abs(Math.sin(modCounter/agent.clock2)),
                Life.Utils.cap(hearingAccum),
                Life.Utils.cap(blood),

                discomfort,

                Life.Utils.cap(p[3]),
                Life.Utils.cap(r[3]),
                Life.Utils.cap(g[3]),
                Life.Utils.cap(b[3])


            ];
        }
    },

    this.processOutputs = function(){
        for(var id in _this.agents){
            var agent = _this.agents[id];

            agent.red = agent.out[2];
            agent.green = agent.out[3];
            agent.blue = agent.out[4];
            agent.wheel1 = agent.out[0];
            agent.wheel2 = agent.out[1];

            agent.sprinting = agent.out[6] > 0.5;
            agent.soundMultiplier = agent.out[7];
            agent.give = agent.out[8];

            var g = agent.out[5];
            if(agent.spikeLength < g){
                agent.spikeLength += parameters.agent.spikeSpeed;
            }else if(agent.spikeLength > g){
                agent.spikeLength = g;
            }


            //Move bots
            //$V is Sylvester vector library, Create a point on the diameter of bot
            var v = $V([parameters.agent.size / 2, 0]);
            v = v.rotate(agent.angle + Math.PI / 2, [0,0]);

            var wheel1Position = agent.pos.add(v);
            var wheel2Position = agent.pos.subtract(v);

            var BW1 = parameters.agent.speed * agent.wheel1;
            var BW2 = parameters.agent.speed * agent.wheel2;
            if(agent.sprinting){
                BW1 *= parameters.agent.sprintMultiplier;
                BW2 *= parameters.agent.sprintMultiplier;
            }

            if(agent.id == 0){
                //console.log(v, wheel1Position, BW1);
            }

            var vv = wheel2Position.subtract(agent.pos);
            vv = vv.rotate(-BW1, [0,0]);
            agent.pos = wheel2Position.subtract(vv);

            if(agent.id == 0){
                //console.log(agent.pos);
            }

            agent.angle -= BW1;
            if(agent.angle < Math.PI) agent.angle = Math.PI - (-Math.PI-agent.angle);
            vv = agent.pos.subtract(wheel1Position);
            vv = vv.rotate(BW2, [0,0]);
            agent.pos = wheel1Position.add(vv);
            agent.angle += BW2;
            if(agent.angle > Math.PI) agent.angle = -Math.PI + (agent.angle - Math.PI);

            if(agent.pos.elements[0] < 0) agent.pos.elements[0] = parameters.width + agent.pos.elements[0];
            if(agent.pos.elements[0] >= parameters.width) agent.pos.elements[0] = agent.pos.elements[0] - parameters.width;
            if(agent.pos.elements[1] < 0) agent.pos.elements[1] = parameters.height + agent.pos.elements[1];
            if(agent.pos.elements[1] >= parameters.height) agent.pos.elements[1] = agent.pos.elements[1] - parameters.height;



            //Herbivores food intake
            var cx = Math.floor(agent.pos.elements[0]/parameters.cellSize);
            var cy = Math.floor(agent.pos.elements[1]/parameters.cellSize);
            var foodHere = _this.food[cx][cy];
            if(foodHere > 0 && agent.health < 2){
                var intake = Math.min(foodHere, parameters.agent.foodIntake);
                var speedMultiplier = (1-Math.abs(agent.wheel1)+Math.abs(agent.wheel2)/2)*0.7 + 0.3;
                intake *= agent.herbivore * speedMultiplier;
                agent.health += intake;
                agent.bodyFertilityBonus -= 3*intake;
                _this.food[cx][cy] -= Math.min(foodHere, parameters.agent.foodWasted);
                //console.log(foodHere, _this.food[cx][cy]);
            }

            //Gifting of food
            agent.foodSupply = 0;
            if(agent.give > 0.5){
                for(var id2 in _this.agents){
                    var agent2 = _this.agents[id2];
                    var d = agent.pos.distanceFrom(agent2.pos);
                    if(d < parameters.agent.foodTradeDistance){
                        if(agent2.health < 2) agent2.health += parameters.agent.foodTraded;
                        agent.health -= parameters.agent.foodTraded;
                        agent2.foodSupply += parameters.agent.foodTraded;
                        agent.foodSupply -= parameters.agent.foodTraded;
                    }

                }
            }

            if(modCounter % 2 == 0){
                //Carnivores only
                if(agent.herbivore > 0.8 || agent.spikeLength < 0.2 || agent.wheel1 < 0.5 || agent.wheel2 <0.5) continue;
                for(var id2 in _this.agents){
                    var agent2 = _this.agents[id2];
                    if(agent == agent2) continue;
                    var d = agent.pos.distanceFrom(agent2.pos);
                    if(d<parameters.agent.size){
                        var v = $V([1,0]);
                        v.rotate(agent.angle, [0,0]);
                        var diff = v.angleFrom(agent2.pos.subtract(agent.pos));
                        if(Math.abs(diff) < Math.PI/8){
                            var speedMultiplier = 1;
                            if(agent.boost) speedMultiplier = parameters.agent.sprintMultiplier;
                            var damage = parameters.agent.spikeStrength * agent.spikeLength * Math.max(Math.abs(agent.wheel1),Math.abs(agent.wheel2))*parameters.agent.sprintMultiplier;
                            agent2.health -= damage;

                            if(agent.health>2) agent.health = 2;
                            agent.spikeLength = 0;

                            agent.indicator = {
                                size:40*damage,
                                red:1,
                                green:1,
                                blue:0
                            };

                            var v2 = $V([1,0]);
                            v2.rotate(agent2.angle, [0,0]);
                            var adiff = v.angleFrom(v2);
                            if(Math.abs(adiff)<Math.PI/2)
                            {
                                agent2.spikeLength = 0;
                            }
                            agent2.spiked = true;
                        }
                    }

                }

            }


        }

    },

    this.brainsTick = function(){
        for(var id in _this.agents){
            var agent = _this.agents[id];
            agent.tick();
        }
    },



    this.addCarnivore = function(){
        var agent = new Life.Agent(parameters);
        agent.id = idCounter;
        idCounter++;
        agent.herbivore = Math.random()/10;
        _this.agents.push(agent);
    },

    this.addHerbivore = function(){
        var agent = new Life.Agent(parameters);
        agent.id = idCounter;
        idCounter++;
        agent.herbivore = Math.random()/10 + 0.9;
        _this.agents.push(agent);
    },

    this.sexuallyReproduce = function(){
        var i1 = Math.floor(Math.random() * _this.agents.length);
        var i2 = Math.floor(Math.random() * _this.agents.length);
        for(var i = 0; i < _this.agents.length; i++){
            if(_this.agents[i].age > _this.agents[i1].age && Math.random() < 0.1) i1 = i;
            if(_this.agents[i].age > _this.agents[i2].age && Math.random() < 0.1 && i!=i1) i2 = i;
        }
        var newAgent = _this.agents[i1].crossover(_this.agents[i2]);
        newAgent.id = idCounter;
        idCounter++;
        _this.agents.push(newAgent);
    },

    this.asexuallyReproduce = function(agent, mutationRate1, mutationRate2){
        if(Math.random()<0.04) mutationRate1 *= Math.random() * 10;
        if(Math.random()<0.04) mutationRate2 *= Math.random() * 10;

        agent.indicator = {
            size:30,
            red:0,
            green:0.8,
            blue:0
        };

        for(var i =0; i < parameters.agent.babies; i++){
            var agent2 = agent.reproduce(mutationRate1, mutationRate2);
            agent2.id = idCounter;
            idCounter++;
            _this.agents.push(agent2);
        }

        console.log("agent "+agent.id +" had 2 babies!");
    },


    this.draw = function(view, drawFood){

        if(drawFood){
            for(var x = 0; x < foodWidth; x++){
                for(var y = 0; y < foodWidth; y++){
                    var f = 0.5 * _this.food[x][y]/parameters.maxFood;
                    view.drawFood(x,y,f);
                }
            }
        }

        for(var id in _this.agents){
            view.renderAgent(_this.agents[id]);
        }
        //view.drawMisc();
    },

    this.numHerbivoresCarnivores = function(){
        var h = 0, c = 0;
        for(var id in _this.agents){
            var agent = _this.agents[id];
            if(agent.herbivore > 0.5){
                h++;
            }else{
                c++;
            }
            return [h,c];
        }
    },

    _this.addRandomBots(parameters.minAgents);
    window.setInterval(this.update, parameters.tickDuration);
};