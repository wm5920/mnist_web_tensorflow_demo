'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global $ */
var Main = function () {
    function Main() {
        _classCallCheck(this, Main);

        this.canvas = document.getElementById('main');
        this.input = document.getElementById('input');
        this.canvas.width = 449; // 16 * 28 + 1
        this.canvas.height = 449; // 16 * 28 + 1
        this.ctx = this.canvas.getContext('2d');
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.initialize();
    }

    _createClass(Main, [{
        key: 'initialize',
        value: function initialize() {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(0, 0, 449, 449);
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, 0, 449, 449);
            this.ctx.lineWidth = 0.05;
            for (var i = 0; i < 27; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo((i + 1) * 16, 0);
                this.ctx.lineTo((i + 1) * 16, 449);
                this.ctx.closePath();
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.moveTo(0, (i + 1) * 16);
                this.ctx.lineTo(449, (i + 1) * 16);
                this.ctx.closePath();
                this.ctx.stroke();
            }
            this.drawInput();
            $('#output td').text('').removeClass('success');
        }
    }, {
        key: 'onMouseDown',
        value: function onMouseDown(e) {
            this.canvas.style.cursor = 'default';
            this.drawing = true;
            this.prev = this.getPosition(e.clientX, e.clientY);
        }
    }, {
        key: 'onMouseUp',
        value: function onMouseUp() {
            this.drawing = false;
            this.drawInput();
        }
    }, {
        key: 'onMouseMove',
        value: function onMouseMove(e) {
            if (this.drawing) {
                var curr = this.getPosition(e.clientX, e.clientY);
                this.ctx.lineWidth = 16;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(this.prev.x, this.prev.y);
                this.ctx.lineTo(curr.x, curr.y);
                this.ctx.stroke();
                this.ctx.closePath();
                this.prev = curr;
            }
        }
    }, {
        key: 'getPosition',
        value: function getPosition(clientX, clientY) {
            var rect = this.canvas.getBoundingClientRect();
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }
    }, {
        key: 'drawInput',
        value: function drawInput() {
            var ctx = this.input.getContext('2d');
            var img = new Image();
            img.onload = function () {
                var inputs = [];
                var small = document.createElement('canvas').getContext('2d');
                small.drawImage(img, 0, 0, img.width, img.height, 0, 0, 28, 28);
                var data = small.getImageData(0, 0, 28, 28).data;
                for (var i = 0; i < 28; i++) {
                    for (var j = 0; j < 28; j++) {
                        var n = 4 * (i * 28 + j);
                        inputs[i * 28 + j] = (data[n + 0] + data[n + 1] + data[n + 2]) / 3;
                        ctx.fillStyle = 'rgb(' + [data[n + 0], data[n + 1], data[n + 2]].join(',') + ')';
                        ctx.fillRect(j * 5, i * 5, 5, 5);
                    }
                }
                if (Math.min.apply(Math, inputs) === 255) {
                    return;
                }
                $.ajax({
                    url: '/api/mnist',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(inputs),
                    success: function success(data) {
                        for (var _i = 0; _i < 2; _i++) {
                            var max = 0;
                            var max_index = 0;
                            for (var _j = 0; _j < 10; _j++) {
                                var value = Math.round(data.results[_i][_j] * 1000);
                                if (value > max) {
                                    max = value;
                                    max_index = _j;
                                }
                                var digits = String(value).length;
                                for (var k = 0; k < 3 - digits; k++) {
                                    value = '0' + value;
                                }
                                var text = '0.' + value;
                                if (value > 999) {
                                    text = '1.000';
                                }
                                $('#output tr').eq(_j + 1).find('td').eq(_i).text(text);
                            }
                            for (var _j2 = 0; _j2 < 10; _j2++) {
                                if (_j2 === max_index) {
                                    $('#output tr').eq(_j2 + 1).find('td').eq(_i).addClass('success');
                                } else {
                                    $('#output tr').eq(_j2 + 1).find('td').eq(_i).removeClass('success');
                                }
                            }
                        }
                    }
                });
            };
            img.src = this.canvas.toDataURL();
        }
    }]);

    return Main;
}();

$(function () {
    var main = new Main();
    $('#clear').click(function () {
        main.initialize();
    });
});