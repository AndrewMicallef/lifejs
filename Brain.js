Life.Box = function(parameters){

    var _this = this;

    this.weight = Array();
    this.id = Array();
    this.type = Array();

    this.damper = Math.random() * 0.2 + 0.9;
    this.globalWeight = Math.random() * 5;
    this.bias = Math.random() * 4 - 2;

    this.target = 0;
    this.output = 0;
    this.oldOut = 0;

    for(var i =0; i < parameters.brain.connections; i++){
        _this.weight[i] = Math.random()*6 - 3;
        if(Math.random() < 0.5) _this.weight[i] = 0;

        _this.id[i] = Math.floor(Math.random()*parameters.brain.size);
        if(Math.random() < 0.2) _this.id[i] = Math.round(Math.random()*parameters.brain.inputSize);

        _this.type[i] = (Math.random() < 0.05) ? 1 : 0;
    }

};

Life.Brain = function(parameters){

    var _this = this;

    this.boxes = Array();

    for(var i = 0; i < parameters.brain.size; i++){
        _this.boxes.push(new Life.Box(parameters));
    }


    this.tick = function(input, output){
        for(var i = 0; i < parameters.brain.inputSize; i++){
            _this.boxes[i].output = input[i];
        }

        for(var i = parameters.brain.inputSize; i < parameters.brain.size; i++){
            var box = _this.boxes[i];

            var acc = 0;
            for(var j = 0; j < parameters.brain.connections; j++){
                var index = box.id[j];
                var type = box.type[j];
                var value = _this.boxes[index].output;

                if(type == 1){
                    value -= _this.boxes[index].oldOut;
                    value *= 10;
                }
                //console.log(box);


                acc+= value * box.weight[j];
                //console.log(acc);
            }

            acc *= box.globalWeight;
            //console.log(acc);
            acc += box.bias;
            //console.log(acc);
            acc = 1/(1+Math.exp(-acc));
            //console.log(acc);
            //console.log("---");

            box.target = acc;
        }

        for(var i = 0; i < parameters.brain.size; i++){
            _this.boxes[i].oldOut = _this.boxes[i].output;
        }

        for(var i = parameters.brain.inputSize; i < parameters.brain.size; i++){
            var box = _this.boxes[i];
            box.output += (box.target - box.output) * box.damper;
        }

        for(var i = 0; i < parameters.brain.outputSize; i++){
            output[i] = _this.boxes[parameters.brain.size-1-i].output;
        }
    },


    this.mutate = function(mutationRate1, mutationRate2){
        for(var i = 0; i < parameters.brain.size; i++){
            if(Math.random() < mutationRate1){
                _this.boxes[i].bias += Life.Utils.randomNormal(0, mutationRate2);
            }

            if(Math.random() < mutationRate1){
                _this.boxes[i].damper += Life.Utils.randomNormal(0, mutationRate2);
                if(_this.boxes[i].damper < 0.001) _this.boxes[i].damper = 0.001;
                if(_this.boxes[i].damper > 1) _this.boxes[i].damper = 1;
            }

            if(Math.random() < mutationRate1){
                _this.boxes[i].globalWeight += Life.Utils.randomNormal(0, mutationRate2);
                if(_this.boxes[i].globalWeight < 0) _this.boxes[i].globalWeight = 0;
            }

            if(Math.random() < mutationRate1){
                var rc = Math.round(Math.random() * parameters.brain.connections);
                _this.boxes[i].weight[rc] += Life.Utils.randomNormal(0, mutationRate2);
            }

            if(Math.random() < mutationRate1){
                var rc = Math.round(Math.random() * parameters.brain.connections);
                _this.boxes[i].type[rc] = 1 - _this.boxes[i].type[rc];
            }

            if(Math.random() < mutationRate1){
                var rc = Math.round(Math.random() * parameters.brain.connections);
                var ri = Math.round(Math.random() * parameters.brain.size);
                _this.boxes[i].id[rc] = ri;
            }
        }
    },

    this.crossover = function(partner){
        var brain = new Life.Brain(parameters);

        for(var i = 0; i < brain.boxes.length; i++){
            if(Math.random() < 0.5){
                brain.boxes[i].bias = _this.boxes[i].bias;
                brain.boxes[i].globalWeight = _this.boxes[i].globalWeight;
                brain.boxes[i].damper = _this.boxes[i].damper;
                for(var j = 0; j < brain.boxes[i].id.length; j++){
                    brain.boxes[i].id[j] = _this.boxes[i].id[j];
                    brain.boxes[i].weight[j] = _this.boxes[i].weight[j];
                    brain.boxes[i].type[j] = _this.boxes[i].type[j];
                }
            }else{
                brain.boxes[i].bias = partner.boxes[i].bias;
                brain.boxes[i].globalWeight = partner.boxes[i].globalWeight;
                brain.boxes[i].damper = partner.boxes[i].damper;
                for(var j = 0; j < brain.boxes[i].id.length; j++){
                    brain.boxes[i].id[j] = partner.boxes[i].id[j];
                    brain.boxes[i].weight[j] = partner.boxes[i].weight[j];
                    brain.boxes[i].type[j] = partner.boxes[i].type[j];
                }
            }
        }
        return brain;
    }

};