Life.Agent = function(parameters){

    //Initial position and angle
    var _x = Math.floor(Math.random() * parameters.width),
        _y = Math.floor(Math.random() * parameters.height),
        _this = this;

    this.id = 0;
    this.age = 0;
    this.pos = $V([_x, _y]);
    this.angle = (2 * Math.random() * Math.PI) - Math.PI;

    this.spikeLength = 0;
    this.spiked = false;

    //Colour
    this.red = 0;
    this.green = 0;
    this.blue = 0;

    this.wheel1 = 0;
    this.wheel2 = 0;

    this.soundMultiplier = 1;

    this.mutationRate = [
        Math.random() * 0.004 + 0.001,
        Math.random() * 0.04 + 0.03
    ];
    this.generationCount = 0;
    this.hybrid = false;


    this.clock1 = Math.random() * 95 + 5;
    this.clock2 = Math.random() * 95 + 5;

    this.sprinting = false;
    this.give = 0;
    this.foodSupply = 0;
    this.herbivore = Math.random();
    this.health = Math.random() * 0.1 + 1;

    this.temperaturePreference = Math.random();

    this.in = new Array();
    this.out = new Array();
    for(var i = 0; i < parameters.brain.outputSize; i++){
        _this.out[i] = 0;
    }

    this.repCounter = this.herbivore * ((Math.random() * 0.2) + parameters.agent.reproductionRate.herbivore - 0.1)
                      + (1-this.herbivore) * ((Math.random() * 0.2) + parameters.agent.reproductionRate.herbivore - 0.1);


    this.smellModifier = Math.random() * 0.4 + 0.1;
    this.soundModifier = Math.random() * 0.4 + 0.2;
    this.hearingModifier = Math.random() * 0.6 + 0.7;
    this.eyeSenseModifier = Math.random() * 2 + 1;
    this.bloodModifier = Math.random() * 2 + 1;


    //Initial eye properties
    this.eyeFov = new Array();
    this.eyeDir = new Array();
    for(var i = 0; i < 4; i++){
        this.eyeFov[i] = Math.random() * 1.5 + 0.5;
        this.eyeDir[i] = Math.random() * Math.PI * 2;
    }


    //Event indication
    this.indicator = {
        size:0,
        red:0,
        green:0,
        blue:0
    };

    this.brain = new Life.Brain(parameters);

    this.tick = function(){
        if(_this.id == 0){
            //console.log(_this.id, _this.in, _this.out);
        }
        _this.brain.tick(_this.in, _this.out);
    },

    this.asexuallyReproduce = function(mutationRate1, mutationRate2){
        //Create a new agent
        var agent = new Life.Agent(parameters);

        //Place it behind its parent
        var fb = $V([parameters.agent.size/2,0]);
        fb.rotate(-agent.angle);
        agent.pos = _this.pos.add(fb).add($V([Math.random() * parameters.agent.size - parameters.agent.size, Math.random() * parameters.agent.size - parameters.agent.size]));
        if(agent.pos.elements[0] < 0) agent.pos.elements[0] = parameters.width + agent.pos.elements[0];
        if(agent.pos.elements[0] > parameters.width) agent.pos.elements[0] = agent.pos.elements[0] - parameters.width;
        if(agent.pos.elements[1] < 0) agent.pos.elements[1] = parameters.height + agent.pos.elements[1];
        if(agent.pos.elements[1] > parameters.height) agent.pos.elements[1] = agent.pos.elements[1] - parameters.height;

        //Assign generation number and nutrient value for body
        agent.generationCount = _this.generationCount+1;
        agent.repCounter = agent.herbivore * ((Math.random() * 0.2) + parameters.agent.reproductionRate.herbivore - 0.1)
            + (1-agent.herbivore) * ((Math.random() * 0.2) + parameters.agent.reproductionRate.carnivore - 0.1);

        //Copy mutation rate from parent, randomised using normal distribution with sigma value from parameters
        agent.mutationRate = _this.mutationRate;
        if(Math.random() < 0.1) agent.mutationRate[0] = Life.Utils.randomNormal(_this.mutationRate[0], parameters.mutationRate[0]);
        if(Math.random() < 0.1) agent.mutationRate[1] = Life.Utils.randomNormal(_this.mutationRate[1], parameters.mutationRate[1]);
        if(_this.mutationRate[0] < 0.001) _this.mutationRate[0] = 0.001;
        if(_this.mutationRate[1] < 0.02) _this.mutationRate[1] = 0.02;

        //Randomise food preference and body clocks from parent's values and mutation rate
        agent.herbivore = Life.Utils.cap(Life.Utils.randomNormal(_this.herbivore, 0.03));
        if(Math.random() < mutationRate1 * 5) agent.clock1 = Life.Utils.randomNormal(agent.clock1, mutationRate2);
        if(agent.clock1 < 2) agent.clock1 = 2;
        if(Math.random() < mutationRate1 * 5) agent.clock2 = Life.Utils.randomNormal(agent.clock2, mutationRate2);
        if(agent.clock2 < 2) agent.clock2 = 2;

        //Copy senses from parent
        agent.smellModifier = _this.smellModifier;
        agent.soundModifier = _this.soundModifier;
        agent.hearingModifier = _this.hearingModifier;
        agent.eyeSenseModifier = _this.eyeSenseModifier;
        agent.bloodModifier = _this.bloodModifier;

        //Mutate senses
        if(Math.random() < mutationRate1 * 5) agent.smellModifier = Life.Utils.randomNormal(agent.smellModifier, mutationRate2);
        if(Math.random() < mutationRate1 * 5) agent.soundModifier = Life.Utils.randomNormal(agent.soundModifier, mutationRate2);
        if(Math.random() < mutationRate1 * 5) agent.hearingModifier = Life.Utils.randomNormal(agent.hearingModifier, mutationRate2);
        if(Math.random() < mutationRate1 * 5) agent.eyeSenseModifier = Life.Utils.randomNormal(agent.eyeSenseModifier, mutationRate2);
        if(Math.random() < mutationRate1 * 5) agent.bloodModifier = Life.Utils.randomNormal(agent.bloodModifier, mutationRate2);

        //Copy and mutate eyes
        agent.eyeFov = _this.eyeFov;
        agent.eyeDir = _this.eyeDir;
        for(var i = 0; i < parameters.agent.numberEyes; i++){
            if(Math.random() < mutationRate1 * 5) agent.eyeFov[i] = Life.Utils.randomNormal(agent.eyeFov[i], mutationRate2);
            if(Math.random() < mutationRate1 * 5) agent.eyeDir[i] = Life.Utils.randomNormal(agent.eyeDir[i], mutationRate2);
            if(agent.eyeFov[i] < 0) agent.eyeFov = 0;
            if(agent.eyeDir[i] < 0) agent.eyeDir = 0;
            if(agent.eyeDir[i] > 2* Math.PI) agent.eyeDir = 2*Math.PI;
        }

        agent.temperaturePreference = Life.Utils.cap(Life.Utils.randomNormal(_this.temperaturePreference, 0.005));
        agent.brain = _this.brain;
        agent.brain.mutate(mutationRate1, mutationRate2);

        return agent;
    },

    this.crossover = function(partner){
        var agent = new Life.Agent(parameters);
        agent.hybrid = true;
        agent.generationCount = _this.generationCount;
        if(partner.generationCount < agent.generationCount) agent.generationCount = partner.generationCount;

        //Randomise which parent attributes are inherited from
        agent.clock1 = Math.random() < 0.5 ? _this.clock1 : partner.clock1;
        agent.clock2 = Math.random() < 0.5 ? _this.clock2 : partner.clock2;
        agent.herbivore = Math.random() < 0.5 ? _this.herbivore : partner.herbivore;
        agent.mutationRate = Math.random() < 0.5 ? _this.mutationRate : partner.mutationRate;
        agent.temperaturePreference = Math.random() < 0.5 ? _this.temperaturePreference : partner.temperaturePreference;

        agent.smellModifier = Math.random() < 0.5 ? _this.smellModifier: partner.smellModifier;
        agent.soundModifier= Math.random() < 0.5 ? _this.soundModifier: partner.soundModifier;
        agent.hearingModifier = Math.random() < 0.5 ? _this.hearingModifier: partner.hearingModifier;
        agent.eyeSenseModifier = Math.random() < 0.5 ? _this.eyeSenseModifier: partner.eyeSenseModifier;
        agent.bloodModifier = Math.random() < 0.5 ? _this.bloodModifier: partner.bloodModifier;

        agent.eyeFov = Math.random() < 0.5 ? _this.eyeFov: partner.eyeFov;
        agent.eyeDir = Math.random() < 0.5 ? _this.eyeDir: partner.eyeDir;

        agent.brain = _this.brain.crossover(partner.brain);

        return agent;
    }
};