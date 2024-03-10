window.addEventListener('load', function(){
    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas1'));
    const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d',{
            willReadFrequently: true
    }));

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // document.body.addEventListener("touchstart", function(e){ if (e.target.nodeName == 'CANVAS') { e.preventDefault(); } }, false);
    // document.body.addEventListener("touchend", function(e){ if (e.target.nodeName == 'CANVAS') { e.preventDefault(); } }, false);
    // document.body.addEventListener("touchmove", function(e){ if (e.target.nodeName == 'CANVAS') { e.preventDefault(); } }, false);

    class Particle {

        constructor(effect,x,y,color){
            this.effect = effect;
            //NOTE: Position on load and default position
            this.x = Math.random() * this.effect.width;
            this.y = Math.random() * this.effect.width;
            this.originX = Math.floor(x);
            this.originY = Math.floor(y);
            this.color = color;
            this.size = this.effect.gap;

            //NOTE: Physics - velocity, ease(acceleration to), friction(acceleration from)
            this.vx = 0;
            this.vy = 0;
            this.ease = 0.15;
            this.friction = 0.9;

            //NOTE: Current state - distance from origin, force to destination, angle to origin x,y
            this.dx = 0;
            this.dy = 0;
            this.distance = 0;
            this.force = 0;
            this.angle = 0;
        }
        
        draw(context){
            context.fillStyle = this.color;
            context.fillRect(this.x,this.y,this.size,this.size);
        }
        update(){
            //NOTE: Current state calculation
            this.dx = this.effect.mouse.x - this.x;
            this.dy = this.effect.mouse.y - this.y;
            this.distance = this.dx * this.dx + this.dy * this.dy;

            //NOTE: Describes the force
            this.force = -this.effect.mouse.radius / this.distance;
            if(this.distance < this.effect.mouse.radius){
                this.angle = Math.atan2(this.dy, this.dx);
                this.vx += this.force * Math.cos(this.angle);
                this.vy += this.force * Math.sin(this.angle);
            }

            //NOTE: Describes the return to position
            this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
            this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
        }
        warp(){
            this.x += Math.random() * this.effect.width - this.effect.width /2;
            this.y += Math.random() * this.effect.height - this.effect.height /2;
        }
        offsetOrigin(newX,newY){
            this.originX += newX /2;
            this.originY += newY /2;
        }
    }
    
    class Effect {

        constructor(width,height,imageId){
            this.width = width;
            this.height = height;

            this.imageArray = ['image1','image2','image3','image4','image5']; //! HARDCODED FOR DEMO PURPOSE
            this.currentImageIndex = 0;

            this.particlesArray = [];
            this.image = document.getElementById(this.imageArray[this.currentImageIndex]);

            //NOTE: Centering on canvas and establishing center point
            this.centerX = this.width * 0.5;
            this.centerY = this.height * 0.5;
            this.x = this.centerX - this.image.width * 0.5
            this.y = this.centerY - this.image.height * 0.5
            this.gap = 6; //NOTE: Act as a divider of original resolution

            this.mouse = {
                radius: 1500,
                x: undefined,
                y: undefined,
            }

            window.addEventListener('mousemove', event => {
                this.mouse.x = event.x;
                this.mouse.y = event.y;
            });
            window.addEventListener('mousedown', event => {
                this.mouse.radius *= 100 / 4;
            });
            window.addEventListener('mouseup', event => {
                this.mouse.radius = 1500;
            });
        }

        init(context){
            console.time('Image init');

            context.drawImage(this.image,this.x,this.y);
            const pixels = context.getImageData(0,0,this.width,this.height).data;
            // console.log(pixels); -- see image data format (r,g,b,a,r,g,...)
            for (let y = 0; y < this.height; y += this.gap) {
                for (let x = 0; x < this.width; x += this.gap) {
                    const index = (y * this.width + x) * 4;

                    const red = pixels[index];
                    const green  = pixels[index+1];
                    const blue  = pixels[index+2];
                    const alpha  = pixels[index+3];
                    const color = 'rgb('+red+','+green+','+blue+')';
                    if (alpha > 0){
                        this.particlesArray.push(new Particle(this,x,y,color));
                    }
                }
            }
            
            console.timeEnd('Image init');
        }
        draw(context){
            this.particlesArray.forEach(particle => particle.draw(context));
        }
        update(){
            this.particlesArray.forEach(particle => particle.update());
        }
        warp(){
            this.particlesArray.forEach(particle => particle.warp());
        }
        offsetEffect(offsetX,offsetY){
            this.particlesArray.forEach(particle => particle.offsetOrigin(offsetX,offsetY));
        }
        resize(newWidth,newHeight){

            const xDifference = newWidth - this.width;
            const yDifference = newHeight - this.height;

            this.offsetEffect(xDifference,yDifference);

            this.width = newWidth;
            this.height = newHeight;

            this.centerX = newWidth /2;
            this.centerY = newHeight /2;
            this.x = this.centerX - this.image.width /2;
            this.y = this.centerY - this.image.height /2;
        }
        nextImage(){
            if (this.currentImageIndex >= this.imageArray.length -1) {
                this.currentImageIndex = 0;
            } else {
                this.currentImageIndex++;
            }
            this.particlesArray = [];
            this.image = document.getElementById(this.imageArray[this.currentImageIndex]);
        }
    }

    const effect = new Effect(canvas.width,canvas.height,'image1');
    effect.init(ctx);    
    

    function animate(){
        ctx.clearRect(0,0,canvas.width,canvas.height)
        effect.draw(ctx);
        effect.update();
        requestAnimationFrame(animate);
    }
    animate();

    // warp button
    const warpButton = document.getElementById('warpButton');
    warpButton.addEventListener('mousedown', function(){
        effect.warp();
    });

    const nextButton = document.getElementById('nextButton');
    nextButton.addEventListener('mousedown', function(){
        ctx.clearRect(0,0,canvas.width,canvas.height)
        effect.nextImage();
        effect.resize(canvas.width,canvas.height);
        effect.init(ctx);
    });

    window.addEventListener('resize', function(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        effect.resize(canvas.width,canvas.height);
    });
});