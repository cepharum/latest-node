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


module.exports = function findChannels( requestedMajor = null ) {
	return new Promise( ( resolve, reject ) => {
		const baseUrl = Url.parse( "https://nodejs.org/dist/" );

		const request = ( baseUrl.protocol === "https:" ? Https : Http ).request( baseUrl, function( response ) {
			if ( response.statusCode !== 200 ) {
				return reject( new Error( "request for generic index of downloads failed" ) );
			}

			let chunks = [];

			response.on( "error", reject );
			response.on( "data", chunk => chunks.push( chunk ) );
			response.on( "end", () => {
				const html = Buffer.concat( chunks ).toString( "utf8" );

				const parser = /<a href=(["'])([^"'>]+)\1[^>]*>([\s\S]+?)<\/a/gi;
				const urlPerMajor = {};
				let match, url, label;

				while ( ( match = parser.exec( html ) ) ) {
					[ , , url, label ] = match;

					label = label.replace( /<[^>]+>/g, "" ).trim();
					match = label.match( /^latest-v(\d+)\.x/ );
					if ( match ) {
						let [ , major ] = match;

						major = parseInt( major );
						if ( major >= 4 ) {
							if ( major === requestedMajor ) {
								const result = {};
								result[major] = qualifyUrl( baseUrl, url );
								return resolve( result );
							}

							urlPerMajor[major] = qualifyUrl( baseUrl, url );
						}
					}
				}

				let channels = [ "latest", "stable", "lts" ];
				let result = {};

				let majors = Object.keys( urlPerMajor ).sort( ( l, r ) => r - l );
				for ( let i = 0, length = majors.length; i < length; i++ ) {
					const channel = channels.shift();
					if ( !channel ) {
						break;
					}

					result[channel] = urlPerMajor[majors[i]];
				}

				resolve( result );
			} );
		} );

		request.on( "error", reject );

		request.end();
	} );
};
