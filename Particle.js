class Particle {
    constructor(x,y,color) {
        // Location
        this.position = { x:x , y:y };
        this.origin = { x:x , y:y }
        
        // Characteristics
        this.color = color;
        this.size = 64;
        this.mass = 1;

        // Physics
        this.velocity = { x:0 , y:0 };
        this.friction = 0.1;
        

        this.history = [];
        this.historyLimit = 256;
    }

    update(){
        this.updateState();
        this.updateVelocity();
        this.updatePosition();
    }

    updateState(){
        this.calculateExternalForces();
        this.calculateInternalForces();
    }

    updateVelocity(){
        applyFriction(); // Depends on mass
        applyDamping(); // Depends on velocity
    }
    updatePosition(){
        applyVelocity(); //! Fuse with updateVelocity?
    }

    calculateExternalForces(){
        applyGravity();
        calculateInertia();
        calculateEnergy();
        calculateMomentum();
    };

    calculateInternalForces(){
        calculateAcceleration();
        collisionDetection();
    };
    

    updateHistory() {
        this.history.unshift({ x: this.position.x, y: this.position.y });

        if (this.history.length > this.historyLimit) {this.history.pop()};
    }

    draw(context){
        context.fillStyle = this.color;
        context.fillRect(this.x,this.y,this.size,this.size);
    }

    drawTrail(context,trailLength) {
        context.fillStyle = "rgba(255, 255, 255, 0.2)";
        for (let i = 0; i < trailLength; i++) {
            coordinate = this.history[i];
            context.globalAlpha = alpha;
            context.fillRect(coordinate.x, coordinate.y, this.size, this.size);
        }
        context.globalAlpha = 1;
    }
}