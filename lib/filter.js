/**
 * (c) 2017 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */

"use strict";

/**
 * @type {Filter}
 * @name Filter
 * @property {?string} os
 * @property {?string} platform
 * @property {?int} major
 * @property {string} channel
 * @property {?string} format
 * @property {string} mode
 */
class Filter {
	/**
	 */
	constructor() {
		Object.defineProperties( this, {
			_criteria: { value: {
				os: null,
				platform: null,
				major: null,
				channel: "lts",
				format: null,
				mode: "fetch",
			} },
			os: { get: () => this._criteria.os },
			platform: { get: () => this._criteria.platform },
			major: { get: () => this._criteria.major },
			channel: { get: () => this._criteria.channel },
			format: { get: () => this._criteria.format },
			mode: { get: () => this._criteria.mode },
		} );
	}

	/**
	 * Sets condition for matching some selected operating system.
	 *
	 * @param {string} value
	 * @returns {boolean} true if value was matching this condition
	 */
	setOperatingSystem( value ) {
		switch ( value ) {
			case "win" :
			case "windows" :
			case "win32" :
			case "ms" :
				this._criteria.os = "win";
				return true;

			case "linux" :
			case "gnu" :
				this._criteria.os = "linux";
				return true;

			case "macos" :
			case "macosx" :
			case "darwin" :
				this._criteria.os = "darwin";
				return true;

			case "aix" :
			case "sunos" :
				this._criteria.os = value;
				return true;
		}

		return false;
	}

	/**
	 * Sets condition for matching some selected hardware platform.
	 *
	 * @param {string} value
	 * @returns {boolean} true if value was matching this condition
	 */
	setPlatform( value ) {
		switch ( value ) {
			case "64" :
			case "x64" :
			case "amd64" :
				this._criteria.platform = "x64";
				return true;

			case "32" :
			case "x86" :
				this._criteria.platform = "x86";
				return true;

			case "arm" :
			case "armv7" :
			case "arm7" :
				this._criteria.platform = "armv71";
				return true;

			case "armv6" :
			case "arm6" :
				this._criteria.platform = "armv61";
				return true;

			case "arm64" :
			case "ppc64" :
			case "ppc64le" :
			case "s390x" :
				this._criteria.os = value;
				return true;
		}

		return false;
	}

	/**
	 * Sets condition for matching some selected major version of node.
	 *
	 * @param {string} value
	 * @returns {boolean} true if value was matching this condition
	 */
	setMajor( value ) {
		let major = parseInt( value );
		if ( major >= 4 ) {
			this._criteria.major = major;
			return true;
		}

		return false;
	}

	/**
	 * Sets condition for matching some selected distribution channel of node.
	 *
	 * @param {string} value
	 * @returns {boolean} true if value was matching this condition
	 */
	setChannel( value ) {
		switch ( value ) {
			case "latest" :
			case "stable" :
			case "lts" :
				this._criteria.channel = value;
				return true;
		}

		return false;
	}

	/**
	 * Sets condition for matching some selected archive format to download.
	 *
	 * @param {string} value
	 * @returns {boolean} true if value was matching this condition
	 */
	setFormat( value ) {
		switch ( value ) {
			case "tar" :
			case "gz" :
			case "tar.gz" :
				this._criteria.format = "tar.gz";
				return true;

			case "xz" :
			case "tar.xz" :
				this._criteria.format = "tar.xz";
				return true;

			case "7zip" :
			case "7z" :
				this._criteria.format = "7z";
				return true;

			case "zip" :
			case "msi" :
			case "pkg" :
				this._criteria.format = value;
				return true;
		}

		return false;
	}

	/**
	 * Selects some mode of operation.
	 *
	 * @param {string} value
	 * @returns {boolean} true if value was matching any mode of operation
	 */
	setMode( value ) {
		switch ( value ) {
			case "fetch" :
			case "test" :
				this._criteria.mode = value;
				return true;
		}

		return false;
	}

	/**
	 * Sets any condition of current filter matching best provided value.
	 *
	 * @param {string} value
	 * @returns {boolean} true if filter has been processed, false otherwise
	 */
	set( value ) {
		return this.setOperatingSystem( value ) ||
		       this.setPlatform( value ) ||
			   this.setMajor( value ) ||
			   this.setChannel( value ) ||
			   this.setFormat( value ) ||
			   this.setMode( value );
	}

	/**
	 * Rates provided information on candidate.
	 *
	 * @param {object<string,boolean>} markers markers on candidate package
	 * @param {string} format format of candidate package
	 * @returns {int} rating on candidate matching current filter (higher values = matching more criteria), 0 on not matching any condition
	 */
	rate( markers, format ) {
		let result = 0;

		let value = this.format;
		if ( value ) {
			if ( format === value ) {
				result++;
			} else {
				return 0;
			}
		} else {
			result++;
		}

		value = this.os;
		if ( value ) {
			if ( markers[value] ) {
				result++;
			} else {
				return 0;
			}
		} else {
			result++;
		}

		value = this.platform;
		if ( value ) {
			if ( markers[value] ) {
				result++;
			} else {
				return 0;
			}
		} else {
			result++;
		}

		return result;
	}
}

module.exports = Filter;
