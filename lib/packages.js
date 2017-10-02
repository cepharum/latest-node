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
const Http = require( "http" );
const Https = require( "https" );

const { qualify: qualifyUrl } = require( "./url" );


/**
 * Fetches URLs of packages listed at provided URL.
 *
 * @param {string} baseUrl URL of index listing packages of a single major version's latest release
 * @returns {Promise<{version:string, format:string, marker:string, url:string}>}
 */
module.exports = function findPackages( baseUrl ) {
	baseUrl = Url.parse( baseUrl );

	return new Promise( ( resolve, reject ) => {
		const request = ( baseUrl.protocol === "https:" ? Https : Http ).request( baseUrl, function( response ) {
			switch ( response.statusCode ) {
				case 200 :
					break;

				case 300 :
				case 301 :
				case 302 :
				case 303 :
				case 304 :
					if ( response.headers.location ) {
						return findPackages( response.headers.location ).then( resolve, reject );
					}

					// falls through
				default :
					return reject( new Error( "request for generic index of downloads failed" ) );
			}

			let chunks = [];

			response.on( "error", reject );
			response.on( "data", chunk => chunks.push( chunk ) );
			response.on( "end", () => {
				const html = Buffer.concat( chunks ).toString( "utf8" );
				const parser = /<a href=(["'])([^"'>]+)\1[^>]*>(.+?)<\/a/gi;

				const packages = [];
				let match, url, label;

				while ( ( match = parser.exec( html ) ) ) {
					[ , , url, label ] = match;

					label = label.replace( /<[^>]+>/g, "" ).trim();
					match = label.match( /^node-v([\d.]+)(?:-([^.]+))?\.([a-z.]+)$/ );
					if ( match ) {
						let [ , version, markers, format ] = match;

						if ( version && format ) {
							const names = markers ? markers.split( "-" ) : [];

							markers = {};
							for ( let i = 0, length = names.length; i < length; i++ ) {
								markers[names[i].trim().toLowerCase()] = true;
							}

							if ( format === "msi" ) {
								markers.win = true;
							}

							url = qualifyUrl( baseUrl, url );

							packages.push( { version, format, markers, url } );
						}
					}
				}

				resolve( packages );
			} );
		} );

		request.on( "error", reject );

		request.end();
	} );
};
