var isPressing = false;

const client = require('net').connect({ port: 1718 })

export function onMouseDown(pos) {
    isPressing = true
    client.write(`d 0 ${pos.x} ${pos.y} 50\n`);
    client.write('c\n')
}
export function onMouseUp() {
    isPressing = false
    client.write('u 0\n');
    client.write('c\n');
}

export function onMove(pos) {
    if (!isPressing) {
        return
    }
    client.write(`m 0 ${pos.x} ${pos.y} 50\n`)
    client.write('c\n')
}

export function onMoveOut() {
    isPressing = false;
}


export function onHome() {
    client.write('h\n')
}

export function onMenu() {
    client.write('e\n')
}

export function onBack() {
    client.write('b\n')
}