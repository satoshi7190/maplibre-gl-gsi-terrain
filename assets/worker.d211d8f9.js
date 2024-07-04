(function(){"use strict";const T=async s=>{const o=await fetch(s);if(!o.ok)throw new Error("Failed to fetch image");const t=await o.blob();return await createImageBitmap(t)},d=`#version 300 es
    in vec4 aPosition;
    out vec2 vTexCoord;

    void main() {
        gl_Position = aPosition;
        vTexCoord = vec2(aPosition.x * 0.5 + 0.5, aPosition.y * -0.5 + 0.5); // Y\u8EF8\u3092\u53CD\u8EE2
    }
`,g=`#version 300 es
    precision mediump float;
    uniform sampler2D heightMap;
    in vec2 vTexCoord;
    out vec4 fragColor;

    void main() {
        vec2 uv = vTexCoord;
        vec4 color = texture(heightMap, uv);

        float r = color.r * 255.0;
        float g = color.g * 255.0;
        float b = color.b * 255.0;

        if (r == 128.0) {
            fragColor = vec4(1.0 / 255.0, 134.0 / 255.0, 160.0 / 255.0, 1.0);
        } else {
            float rgb = r * 65536.0 + g * 256.0 + b;
            float height = (rgb < 8388608.0) ? rgb * 0.01 : (rgb - 16777216.0) * 0.01;

            height = (height + 10000.0) * 10.0;

            float tB = mod(height, 256.0);
            float tG = mod(floor(height / 256.0), 256.0);
            float tR = floor(height / 65536.0);

            fragColor = vec4(tR / 255.0, tG / 255.0, tB / 255.0, 1.0);
        }
    }
`;let e=null,r=null,f=null,E=null;const u=s=>{if(e=s.getContext("webgl2"),!e)throw new Error("WebGL not supported");const o=(a,R,m)=>{const i=a.createShader(R);return i?(a.shaderSource(i,m),a.compileShader(i),a.getShaderParameter(i,a.COMPILE_STATUS)?i:(console.error("An error occurred compiling the shaders: "+a.getShaderInfoLog(i)),a.deleteShader(i),null)):(console.error("Unable to create shader"),null)},t=o(e,e.VERTEX_SHADER,d),c=o(e,e.FRAGMENT_SHADER,g);if(!t||!c)throw new Error("Failed to load shaders");if(r=e.createProgram(),!r)throw new Error("Failed to create program");if(e.attachShader(r,t),e.attachShader(r,c),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))throw console.error("Unable to initialize the shader program: "+e.getProgramInfoLog(r)),new Error("Failed to link program");e.useProgram(r),f=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,f);const l=new Float32Array([-1,-1,1,-1,-1,1,1,1]);e.bufferData(e.ARRAY_BUFFER,l,e.STATIC_DRAW);const n=e.getAttribLocation(r,"aPosition");e.enableVertexAttribArray(n),e.vertexAttribPointer(n,2,e.FLOAT,!1,0,0),E=e.getUniformLocation(r,"heightMap")},h=new OffscreenCanvas(256,256);self.onmessage=async s=>{const{url:o}=s.data;try{const t=await T(o);if(e||u(h),!e||!r||!f||!E)throw new Error("WebGL initialization failed");const c=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,c),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.useProgram(r),e.uniform1i(E,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLE_STRIP,0,4);const l=await h.convertToBlob();if(!l)throw new Error("Failed to convert canvas to blob");const n=new FileReader;n.onloadend=()=>{self.postMessage({id:o,buffer:n.result})},n.readAsArrayBuffer(l)}catch{self.postMessage({id:o,buffer:new ArrayBuffer(0)})}}})();
