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

            this.force = force;
            this.friction = 0.005;

            this.size = 40;
            this.mass = 1;
            this.hitbox = {
                top:this.y - this.size/2,
                right:this.x + this.size/2,
                left:this.x - this.size/2,
                bottom:this.y + this.size/2,
            }

            this.world = World;
        }

        update(){

            const frictionForceX = -this.velocity.vx * this.friction;
            const frictionForceY = -this.velocity.vy * this.friction;

            //add forces
            this.force.fx += frictionForceX ;
            this.force.fy += this.world.gravity * this.mass + frictionForceY;

            // update acceleration
            this.acceleration.ax = this.force.fx / this.mass;
            this.acceleration.ay = this.force.fy / this.mass;

            // update velocity
            this.velocity.vx += this.acceleration.ax * this.world.timeStep;
            this.velocity.vy += this.acceleration.ay * this.world.timeStep;

            // update position
            this.position.x += this.velocity.vx * this.world.timeStep + 0.5 * this.acceleration.ax * Math.pow(this.world.timeStep,2);
            this.position.y += this.velocity.vy * this.world.timeStep + 0.5 * this.acceleration.ay * Math.pow(this.world.timeStep,2);

            // ground
            this.position.y = Math.min(this.position.y,canvas.height - this.size/2);

            this.force = {fx:0,fy:0};
            this.acceleration = {vx:0,vy:0};
            
        }

        draw(context){
            context.fillStyle = 'black';
            context.fillRect(this.position.x-this.size/2,this.position.y-this.size/2,this.size,this.size); // x,y is center of particle
        }
    }

    class World {
        constructor() {
            this.particlesArray = [];

            this.lastFrameTime = performance.now();
            this.timeStep = 0;
            this.timescale = 1;

            this.gravity = 9.8 / 1000;

            this.mouse = {
                x: undefined,
                y: undefined,
            }

            window.addEventListener('mousemove', event => {
                this.mouse.x = event.x;
                this.mouse.y = event.y;
            });
            window.addEventListener('mousedown', event => {
                this.addParticle(this.mouse.x,this.mouse.y);
            });
        }

        update(){
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            this.timeStep = Math.floor(deltaTime * this.timescale);

            this.particlesArray.forEach(particle => {
                particle.update()
            });
        }

        draw(context){
            this.particlesArray.forEach(particle => particle.draw(context));
        }
        addParticle(x,y) {
            this.particlesArray.push(new Particle(x,y,this,{fx:0.05,fy:0}));
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