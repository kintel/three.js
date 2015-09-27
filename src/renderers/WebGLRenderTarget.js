/**
 * @author szimek / https://github.com/szimek/
 * @author alteredq / http://alteredqualia.com/
 * @author Marius Kintel / https://github.com/kintel
 */

function DepthWrapper() {
	this.uuid = THREE.Math.generateUUID();
}
DepthWrapper.prototype = {
	constructor: DepthWrapper,
	clone: function () {
		return new this.constructor().copy( this );
	},
	copy: function ( source ) {
	}
};

/*
 In options, we can specify:
 * Texture parameters for an auto-generated target texture
 * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
 * texture: A target texture of type THREE.Texture or THREE.WebGLRenderTarget
 * depth: A THREE.WebGLRenderTarget to share depth from
*/
THREE.WebGLRenderTarget = function ( width, height, options ) {

	this.uuid = THREE.Math.generateUUID();

	this.width = width;
	this.height = height;

	options = options || {};

	if (options.depth) {
		// Use depth from DepthTexture or WebGLRenderTarget
		if (options.depth instanceof THREE.WebGLRenderTarget) {
			this.depth = options.depth.depth;
		}
		else {
			this.depth = options.depth;
		}
	}

	if (options.texture) {
		if (options.texture instanceof THREE.WebGLRenderTarget) {
			// If given texure is a render target, we can also grab depth from there
			this.texture = options.texture.texture;
			if (!this.depth) this.depth = options.texture.depth;
		}
		// ..or just render to the given texture
		else this.texture = options.texture;
	}
	else {
		// If no texture given, create one
		this.texture = new THREE.Texture(undefined, undefined, 
																		 options.wrapS, options.wrapT,
																		 options.magFilter, options.minFilter,
																		 options.format, options.type,
																		 options.anisotropy);

		// Don't generate mipmaps from target texture
		this.texture.generateMipmaps = true;
	}

	// If we still don't have a depth buffer, let's create one
	// FIXME: We only need this if we actually want a depth buffer
	if (!this.depth) {
		// The wrapper holds GL resources for an auto-generated depth buffer
		this.depth = new DepthWrapper;
	}

	this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
	this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;
};

THREE.WebGLRenderTarget.prototype = {

	constructor: THREE.WebGLRenderTarget,

	setSize: function ( width, height ) {

		if ( this.width !== width || this.height !== height ) {

			this.width = width;
			this.height = height;

			this.dispose();

		}

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		this.width = source.width;
		this.height = source.height;

		this.texture = this.texture.clone();
		if (source.depth) this.depth = source.depth.clone();

		this.depthBuffer = source.depthBuffer;
		this.stencilBuffer = source.stencilBuffer;

		return this;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

};

THREE.EventDispatcher.prototype.apply( THREE.WebGLRenderTarget.prototype );
