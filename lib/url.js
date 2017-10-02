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

const Url = require( "url" );
const Path = require( "path" );


/**
 * Resolves some URL in context of (parsed) base URL.
 *
 * @param {object} baseUrl
 * @param {string} url
 * @returns {string}
 */
module.exports.qualify = function qualifyUrl( baseUrl, url ) {
	if ( url.match( /^[^:/]+:\/\// ) ) {
		return url;
	}

	const copy = {
		protocol: baseUrl.protocol,
		hostname: baseUrl.hostname,
		port: baseUrl.port,
		pathname: baseUrl.path,
		auth: baseUrl.auth,
	};

	if ( url[0] === "/" ) {
		copy.pathname = url;
	} else {
		copy.pathname = Path.posix.resolve( copy.pathname, url );
	}

	return Url.format( copy );
};
