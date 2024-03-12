window.addEventListener('load', function(){
    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas1'));
    const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d',{
            willReadFrequently: true
    }));

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Force {

    }
    class Particle {
        constructor(x,y,World,force = {fx:0,fy:0}) {
            this.position = {x:Math.floor(x),y:Math.floor(y)};
            this.origin = {...this.position};
            this.velocity = {vx:0,vy:0};
            this.acceleration = {ax:0,ay:0};

            this.state = 'moving';
            this.type; // image, standard,
            this.force = force;
            this.friction = 0.005;

            this.size = 40;
            this.mass = 1;
            this.hitbox = {
                top:this.y - this.size/2,
                right:this.x + this.size/2,
                left:this.x - this.size/2,
                bottom:this.y + this.size/2,
            };

            this.world = World;
        };

        update(){

            //NOTE: State machine Particle -> moving, immobile, colliding;
            switch (this.state) {
                case 'moving':
                    this.updateMovingState();
                    break;
                case 'static':
                    break;
                case 'colliding':
                    break;
            };

            
        };

        updateMovingState(){
            this.applyForces();
            this.updateAcceleration();
            this.updateVelocity();
            this.updatePosition();
            this.handleCollision();
            
            this.force = {fx:0,fy:0};
            this.acceleration = {vx:0,vy:0};
        };
        
        applyForces(){
            const frictionForceX = -this.velocity.vx * this.friction;
            const frictionForceY = -this.velocity.vy * this.friction;
            
            this.force.fx += frictionForceX ;
            this.force.fy += this.world.gravity * this.mass + frictionForceY;
        };
        updateAcceleration(){
            this.acceleration.ax = this.force.fx / this.mass;
            this.acceleration.ay = this.force.fy / this.mass;
        };
        updateVelocity(){
            this.velocity.vx += this.acceleration.ax * this.world.timeStep;
            this.velocity.vy += this.acceleration.ay * this.world.timeStep;
        };
        updatePosition(){
            this.position.x += this.velocity.vx * this.world.timeStep + 0.5 * this.acceleration.ax * Math.pow(this.world.timeStep,2);
            this.position.y += this.velocity.vy * this.world.timeStep + 0.5 * this.acceleration.ay * Math.pow(this.world.timeStep,2);
        };
        handleCollision(){
            this.position.y = Math.min(this.position.y,canvas.height - this.size/2);
        };
        
        draw(context){
            context.fillStyle = 'black';
            context.fillRect(this.position.x-this.size/2,this.position.y-this.size/2,this.size,this.size); // x,y is center of particle
        };
    };

    class World {
        constructor() {
            this.particlesArray = [];

            this.lastFrameTime = performance.now();
            this.timeStep = 0;
            this.timescale = 1;

            this.gravity = 9.8 / 1000;

            // History, currentFrame + position
            this.particleLimit = 12;

            this.mouse = {
                x: undefined,
                y: undefined,
            }
            this.clickPos = {
                x: undefined,
                y: undefined,
            }

            window.addEventListener('mousemove', event => {
                this.mouse.x = event.x;
                this.mouse.y = event.y;
            });
            window.addEventListener('mousedown', event => {
                this.clickPos.x = event.x;
                this.clickPos.y = event.y;
            });
            window.addEventListener('mouseup', event => {
                const force = {fx:(this.clickPos.x - this.mouse.x)/500,fy:(this.clickPos.y - this.mouse.y)/500};
                console.log(force);
                this.addParticle(this.mouse.x,this.mouse.y,force);
            });
        }

        update(){
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            this.timeStep = Math.floor(deltaTime * this.timescale);


            if (this.particlesArray.length > this.particleLimit) this.particlesArray.shift() ;
            this.particlesArray.forEach(particle => {
                particle.update()
            });
        }

        draw(context){
            this.particlesArray.forEach(particle => particle.draw(context));
        }
        addParticle(x,y,force) {
            this.particlesArray.push(new Particle(x,y,this,force));
        }
    }

    const world = new World();

    function animate(){
        ctx.clearRect(0,0,canvas.width,canvas.height)
        world.draw(ctx);
        world.update();
        requestAnimationFrame(animate);
    }
    animate();

    // warp button
    const warpButton = document.getElementById('warpButton');
    warpButton.addEventListener('mousedown', function(){
    });

    const nextButton = document.getElementById('nextButton');
    nextButton.addEventListener('mousedown', function(){
    });

    window.addEventListener('resize', function(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // effect.resize(canvas.width,canvas.height);
    });
});