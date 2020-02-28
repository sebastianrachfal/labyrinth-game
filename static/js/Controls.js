function Controls() {
    var _pressedKeys = 0;
    var _oneBit = 0b1;
    var _keyboardCallbacks = [];
    var __internalCounter = 0;
    this.keyboard = {
        keys: {
            w: _oneBit,
            a: _oneBit << 1,
            s: _oneBit << 2,
            d: _oneBit << 3,
            alt: _oneBit << 4,
            ctrl: _oneBit << 5,
            shift: _oneBit << 6,
            space: _oneBit << 7,
            enter: _oneBit << 8,
            // Additional keys
            z: _oneBit << 9,

        },
        getKeyboardData: () => _pressedKeys,
        isHolding: (key) => !!(_pressedKeys & key),
        addKey: (key) => _pressedKeys |= key,
        delKey: (key) => _pressedKeys = !!(_pressedKeys & key) ? _pressedKeys ^ key : _pressedKeys,
        // addKeyboardListener: (func) => { _keyboardCallbacks.push({ id: __internalCounter, callback: func }); return __internalCounter++; },
        // delKeyboardListener: (handle) => {
        //     for (let i; i < _keyboardCallbacks.length; i++)
        //         if (_keyboardCallbacks[i].id === handle) { _keyboardCallbacks.splice(i, 1); break; }
        // },
        handleKey: function (e, _isDown) {
            let func = _isDown ? this.addKey : this.delKey;
            let keys = this.keys;
            switch (e.keyCode) {
                case 87: func(keys.w); break;
                case 65: func(keys.a); break;
                case 83: func(keys.s); break;
                case 68: func(keys.d); break;
                case 18: func(keys.alt); break;
                case 17: func(keys.ctrl); break;
                case 16: func(keys.shift); break;
                case 32: func(keys.space); break;
                case 13: func(keys.enter); break;
                case 90: func(keys.z); break;
                default: return;
            }
            e.preventDefault();
        }
    }
    $(document).keydown((e) => this.keyboard.handleKey(e, true));
    $(document).keyup((e) => this.keyboard.handleKey(e, false));
}
