const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

// Resizing Canvas to fit Screen
canvas.height = innerHeight
canvas.width = innerWidth

// Colors
const colors = {
    primary: "#e7b307",
    secondary: "#dd1324",
    light: "#f9f9f9",
}

// Variables
let objects,
    particles,
    radius,
    x,
    y,
    dx,
    dy,
    lastPos = [],
    lastPosLength = 15

// Event Listeners
addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight
})

// Random Integers
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Objects
function Object(x, y, dx, dy, radius, color, isParticle) {
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
    this.radius = radius
    this.color = color
    this.gravity = 0.98
    this.friction = 0.8
    this.isParticle = isParticle

    this.update = function() {
        if (this.x + this.dx + this.radius > canvas.width ||
            this.x + this.dx - this.radius < 0 )
            this.dx = -this.dx * this.friction

        if (this.y + this.radius + this.dy > canvas.height) {
            this.dy = -this.dy * this.friction

            if (isParticle)
                this.radius -= 1.8
            else
                this.radius -= 3

            if (!this.isParticle && !this.bounceOnce)
                this.bounceOnce = true
        }
        else
            this.dy += this.gravity

        this.x += this.dx
        this.y += this.dy

        if (this.radius > 0)
            this.draw()
    }

    this.draw = function() {

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        ctx.shadowBlur = 50
        ctx.shadowColor = colors.primary
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()

        if (!this.isParticle)
            storeLastPos(this.x, this.y, this.radius)
    }
}

// Store last position of object for trail
function storeLastPos(x, y, radius) {
    lastPos.push ({
        x: x,
        y: y,
        radius: radius
    })

    if (lastPos.length > lastPosLength)
        lastPos.shift()
}

// Implementation
function init() {
    objects = []
    particles = []

    drawBg()
    createObject()
}

// Create Object
function createObject() {
    radius = 30

        x = randomInt(radius, innerWidth - radius)
        y = -100
        dx = randomInt(-15, 15)
        dy = randomInt(0, 20)

        objects.push(new Object(x, y, dx, dy, radius, colors.primary, false))
}

// Draw Background
function drawBg() {
    gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, colors.light)
    gradient.addColorStop(1, colors.primary)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawBg()

    // Update Object
    for (let i = 0; i <= objects.length - 1; i++) {
        let object = objects[i]

        // Check if object bounces the first time to create particles
        if (object.y + object.dy + object.radius > canvas.height && !object.bounceOnce) {
            for (let j = 0; j < 6; j++) {
                dx = randomInt(-15, 15)
                dy = randomInt(5, 40)
                particles.push(new Object(object.x, object.y, dx, dy, 9, colors.primary, true))
            }   
        }

        // Deletes object if it completely shrinks  
        if (object.radius <= 0)
            objects.splice(i, 1)
        else {
            object.update()
        }
    }        
    
    // Create object trail
    for (let j = 0; j < lastPos.length; j++ ) {
        let ratio = (j + 1) / lastPos.length
        lastPos[j].radius *= 0.85;

        ctx.beginPath()
        ctx.arc(lastPos[j].x, lastPos[j].y, lastPos[j].radius, 0, Math.PI * 2, true)
        ctx.shadowBlur = 50
        ctx.shadowColor = colors.light
        ctx.fillStyle = "rgba(228, 226, 233, " + ratio / 2 + ")"
        ctx.fill()
        ctx.closePath()
    }

    // Update Particles

    for (let i = 0; i < particles.length; i++) {
        // Deletes particle if it completely shrinks
        if (particles[i].radius <= 0)
            particles.splice(i, 1)
        else
            particles[i].update()

        // Reinitialize array to erase excess particles
        if (particles.length == 1)
            particles = []
    }

    // Creates object randomly 
    if (randomInt(0, 1000) < 5 && objects.length < 3 || objects.length === 0) {
        createObject()
        lastPosLength = objects.length * 20 
    }
}

init()
animate()