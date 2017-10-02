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

const Http = require( "http" );

const Filter = require( "./filter" );
const FindChannels = require( "./channels" );
const FindPackages = require( "./packages" );


const httpServer = Http.createServer( function( req, res ) {
	const start = Date.now();

	if ( /\b(?:favicon|robots\.txt)\b/.test( req.url ) ) {
		res.statusCode = 404;
		res.end();
		return;
	}

	let [ , path, query ] = req.url.match( /^([^?]+)(?:\?(.*))?$/ );
	if ( query === undefined ) {
		query = "";
	}

	const filter = new Filter()
		.processUserAgent( req.headers["user-agent"] )
		.processUrl( path, query || "" );

	FindChannels( filter.major )
		.then( urls => filter.major ? urls[filter.major] : urls[filter.channel] )
		.then( listUrl => FindPackages( listUrl ) )
		.then( packages => {
			const length = packages.length;

			for ( let i = 0; i < length; i++ ) {
				const pkg = packages[i];

				pkg.rate = filter.rate( pkg.markers, pkg.format );
			}

			packages.sort( ( l, r ) => {
				if ( l.rate === r.rate ) {
					return Object.keys( l.markers ).length - Object.keys( l.markers ).length;
				}

				return l.rate - r.rate;
			} );

			const candidate = packages.pop();
			if ( candidate && candidate.rate > 0 ) {
				return candidate;
			}
		} )
		.then( match => {
			if ( !match ) {
				res.statusCode = 404;
				res.setHeader( "Content-Type", "text/plain; charset=utf8" );
				end( "No package is matching selected conditions!" );
				return;
			}

			switch ( filter.mode ) {
				case "test" :
					res.statusCode = 200;
					res.setHeader( "Content-Type", "text/plain" );
					end( match.url );
					break;

				default :
					res.statusCode = 303;
					res.setHeader( "Location", match.url );
					end();
			}
		} )
		.catch( error => {
			res.statusCode = 500;
			res.setHeader( "Content-Type", "application/json; charset=utf8" );
			end( JSON.stringify( {
				error: error.message,
				// stack: error.stack,
			} ) );
		} );

	/**
	 * Ends current response adding some access logging to stdout.
	 *
	 * @param {string} code
	 */
	function end( code = undefined ) {
		console.log( `${req.method} ${req.url} ${res.statusCode} ${Math.round( Date.now() - start )}ms ${req.headers["user-agent"] || "-"}` );

		res.end( code );
	}
} );

httpServer.listen( process.env.PORT || 3000 );
