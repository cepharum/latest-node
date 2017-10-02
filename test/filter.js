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

const Should = require( "should" );

const Filter = require( "../lib/filter" );


const supportedSystems = [
	"win",
	"windows",
	"win32",
	"ms",
	"linux",
	"gnu",
	"macos",
	"macosx",
	"darwin",
	"aix",
	"sun",
	"sunos",
	"solaris",
];
const supportedPlatforms = [
	"64",
	"x64",
	"amd64",
	"32",
	"x86",
	"arm",
	"armv7",
	"arm7",
	"armv6",
	"arm6",
	"arm64",
	"ppc64",
	"ppc64le",
	"s390x",
];
const supportedMajors = [
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11",
	"20",
];
const supportedChannels = [
	"latest",
	"stable",
	"lts",
];
const supportedFormats = [
	"tar",
	"gz",
	"tar.gz",
	"xz",
	"tar.xz",
	"7zip",
	"7z",
	"zip",
	"msi",
	"pkg",
];
const supportedModes = [
	"fetch",
	"test",
];

/**
 * Combines all filter values supported separately.
 */
function * allSupported() {
	const all = [ supportedSystems, supportedPlatforms, supportedMajors, supportedChannels, supportedFormats, supportedModes ];

	for ( let i = 0; i < all.length; i++ ) {
		for ( let j = 0; j < all[i].length; j++ ) {
			yield all[i][j];
		}
	}
}


suite( "Class Filter", function() {
	test( "can be instantiated", function() {
		Should.exist( Filter );

		( () => new Filter() ).should.not.throw();
	} );

	test( "selects to fetch by default", function() {
		new Filter().mode.should.equal( "fetch" );
	} );

	test( "selects to fetch LTS by default", function() {
		new Filter().channel.should.equal( "lts" );
	} );

	test( "does not select any platform by default", function() {
		Should.not.exist( new Filter().platform );
	} );

	test( "does not select any operating system by default", function() {
		Should.not.exist( new Filter().os );
	} );

	test( "accepts any supported operating system filter value", function() {
		for ( let value of supportedSystems ) {
			const filter = new Filter();

			( () => filter.setOperatingSystem( value ) ).should.not.throw();
			filter.setOperatingSystem( value ).should.be.true();

			filter.os.should.be.ok();
		}
	} );

	test( "accepts any supported platform filter value", function() {
		for ( let value of supportedPlatforms ) {
			const filter = new Filter();

			( () => filter.setPlatform( value ) ).should.not.throw();
			filter.setPlatform( value ).should.be.true();

			filter.platform.should.be.ok();
		}
	} );

	test( "accepts any supported major version filter value", function() {
		for ( let value of supportedMajors ) {
			const filter = new Filter();

			( () => filter.setMajor( value ) ).should.not.throw();
			filter.setMajor( value ).should.be.true();

			filter.major.should.be.aboveOrEqual( 4 );
		}
	} );

	test( "accepts any supported channel filter value", function() {
		for ( let value of supportedChannels ) {
			const filter = new Filter();

			( () => filter.setChannel( value ) ).should.not.throw();
			filter.setChannel( value ).should.be.true();

			filter.channel.should.be.ok();
		}
	} );

	test( "accepts any supported package format filter value", function() {
		for ( let value of supportedFormats ) {
			const filter = new Filter();

			( () => filter.setFormat( value ) ).should.not.throw();
			filter.setFormat( value ).should.be.true();

			filter.format.should.be.ok();
		}
	} );

	test( "accepts any supported mode filter value", function() {
		for ( let value of supportedModes ) {
			const filter = new Filter();

			( () => filter.setMode( value ) ).should.not.throw();
			filter.setMode( value ).should.be.true();

			filter.mode.should.be.ok();
		}
	} );

	test( "accepts any supported filter value", function() {
		const filter = new Filter();

		for ( let value of allSupported() ) {
			( () => filter.set( value ) ).should.not.throw();
			filter.set( value ).should.be.true();
		}
	} );
} );

suite( "On parsing URL class Filter", function() {
	test( "detects any supported operating system filter value as segment of pathname", function() {
		for ( let value of supportedSystems ) {
			for ( let template of [ "#", "/#", "foo/#", "/foo/#", "#/bar", "/#/bar", "foo/#/bar", "/foo/#/bar", "foo/#/bar/#", "/foo/#/bar/#" ] ) {
				const testee = template.replace( /#/g, value );

				const filter = new Filter();
				( () => filter.processUrl( testee, "" ) ).should.not.throw();
				filter.processUrl( testee, "" ).should.equal( filter );

				filter.os.should.be.ok();
			}
		}
	} );

	test( "detects any supported platform filter value as segment of pathname", function() {
		for ( let value of supportedPlatforms ) {
			for ( let template of [ "#", "/#", "foo/#", "/foo/#", "#/bar", "/#/bar", "foo/#/bar", "/foo/#/bar", "foo/#/bar/#", "/foo/#/bar/#" ] ) {
				const testee = template.replace( /#/g, value );

				const filter = new Filter();
				( () => filter.processUrl( testee, "" ) ).should.not.throw();
				filter.processUrl( testee, "" ).should.equal( filter );

				filter.platform.should.be.ok();
			}
		}
	} );

	test( "detects any supported major version filter value as segment of pathname", function() {
		for ( let value of supportedMajors ) {
			for ( let template of [ "#", "/#", "foo/#", "/foo/#", "#/bar", "/#/bar", "foo/#/bar", "/foo/#/bar", "foo/#/bar/#", "/foo/#/bar/#" ] ) {
				const testee = template.replace( /#/g, value );

				const filter = new Filter();
				( () => filter.processUrl( testee, "" ) ).should.not.throw();
				filter.processUrl( testee, "" ).should.equal( filter );

				filter.major.should.be.ok();
			}
		}
	} );

	test( "detects any supported channel filter value as segment of pathname", function() {
		for ( let value of supportedChannels ) {
			for ( let template of [ "#", "/#", "foo/#", "/foo/#", "#/bar", "/#/bar", "foo/#/bar", "/foo/#/bar", "foo/#/bar/#", "/foo/#/bar/#" ] ) {
				const testee = template.replace( /#/g, value );

				const filter = new Filter();
				( () => filter.processUrl( testee, "" ) ).should.not.throw();
				filter.processUrl( testee, "" ).should.equal( filter );

				filter.channel.should.be.ok();
			}
		}
	} );

	test( "detects any supported package format filter value as segment of pathname", function() {
		for ( let value of supportedFormats ) {
			for ( let template of [ "#", "/#", "foo/#", "/foo/#", "#/bar", "/#/bar", "foo/#/bar", "/foo/#/bar", "foo/#/bar/#", "/foo/#/bar/#" ] ) {
				const testee = template.replace( /#/g, value );

				const filter = new Filter();
				( () => filter.processUrl( testee, "" ) ).should.not.throw();
				filter.processUrl( testee, "" ).should.equal( filter );

				filter.format.should.be.ok();
			}
		}
	} );

	test( "detects any supported mode filter value as segment of pathname", function() {
		for ( let value of supportedModes ) {
			for ( let template of [ "#", "/#", "foo/#", "/foo/#", "#/bar", "/#/bar", "foo/#/bar", "/foo/#/bar", "foo/#/bar/#", "/foo/#/bar/#" ] ) {
				const testee = template.replace( /#/g, value );

				const filter = new Filter();
				( () => filter.processUrl( testee, "" ) ).should.not.throw();
				filter.processUrl( testee, "" ).should.equal( filter );

				filter.mode.should.be.ok();
			}
		}
	} );

	test( "detects any supported operating system filter value as query parameter", function() {
		for ( let value of supportedSystems ) {
			for ( let name of [ "os", "operatingsystem", "system" ] ) {
				for ( let version of [ name, name.toUpperCase(), encodeURIComponent( name ), encodeURIComponent( name.toUpperCase() ) ] ) {
					for ( let template of [ "#=!", "?#=!", "foo&#=!", "?foo=baz&#=!", "#=!&bar=bam", "?#=!&bar=bam", "foo&#=!&bar=bam", "?foo=baz&#=!&bar=bam", "foo&#=!&bar=bam&#=!", "?foo=baz&#=!&bar=bam&#=!", "foo&#=!&bar=bam&#=", "?foo=baz&#=!&bar=bam&#=", "foo&#=!&bar=bam&#", "?foo=baz&#=!&bar=bam&#" ] ) {
						const testee = template.replace( /#/g, version ).replace( /!/g, value );

						const filter = new Filter();
						( () => filter.processUrl( "", testee ) ).should.not.throw();
						filter.processUrl( "", testee ).should.equal( filter );

						filter.os.should.be.ok();
					}
				}
			}
		}
	} );

	test( "detects any supported platform filter value as query parameter", function() {
		for ( let value of supportedPlatforms ) {
			for ( let name of [ "platform", "cpu", "processor" ] ) {
				for ( let version of [ name, name.toUpperCase(), encodeURIComponent( name ), encodeURIComponent( name.toUpperCase() ) ] ) {
					for ( let template of [ "#=!", "?#=!", "foo&#=!", "?foo=baz&#=!", "#=!&bar=bam", "?#=!&bar=bam", "foo&#=!&bar=bam", "?foo=baz&#=!&bar=bam", "foo&#=!&bar=bam&#=!", "?foo=baz&#=!&bar=bam&#=!", "foo&#=!&bar=bam&#=", "?foo=baz&#=!&bar=bam&#=", "foo&#=!&bar=bam&#", "?foo=baz&#=!&bar=bam&#" ] ) {
						const testee = template.replace( /#/g, version ).replace( /!/g, value );

						const filter = new Filter();
						( () => filter.processUrl( "", testee ) ).should.not.throw();
						filter.processUrl( "", testee ).should.equal( filter );

						filter.platform.should.be.ok();
					}
				}
			}
		}
	} );

	test( "detects any supported major version filter value as query parameter", function() {
		for ( let value of supportedMajors ) {
			for ( let name of [ "major", "version" ] ) {
				for ( let version of [ name, name.toUpperCase(), encodeURIComponent( name ), encodeURIComponent( name.toUpperCase() ) ] ) {
					for ( let template of [ "#=!", "?#=!", "foo&#=!", "?foo=baz&#=!", "#=!&bar=bam", "?#=!&bar=bam", "foo&#=!&bar=bam", "?foo=baz&#=!&bar=bam", "foo&#=!&bar=bam&#=!", "?foo=baz&#=!&bar=bam&#=!", "foo&#=!&bar=bam&#=", "?foo=baz&#=!&bar=bam&#=", "foo&#=!&bar=bam&#", "?foo=baz&#=!&bar=bam&#" ] ) {
						const testee = template.replace( /#/g, version ).replace( /!/g, value );

						const filter = new Filter();
						( () => filter.processUrl( "", testee ) ).should.not.throw();
						filter.processUrl( "", testee ).should.equal( filter );

						filter.major.should.be.aboveOrEqual( 4 );
					}
				}
			}
		}
	} );

	test( "detects any supported channel filter value as query parameter", function() {
		for ( let value of supportedPlatforms ) {
			for ( let name of ["channel"] ) {
				for ( let version of [ name, name.toUpperCase(), encodeURIComponent( name ), encodeURIComponent( name.toUpperCase() ) ] ) {
					for ( let template of [ "#=!", "?#=!", "foo&#=!", "?foo=baz&#=!", "#=!&bar=bam", "?#=!&bar=bam", "foo&#=!&bar=bam", "?foo=baz&#=!&bar=bam", "foo&#=!&bar=bam&#=!", "?foo=baz&#=!&bar=bam&#=!", "foo&#=!&bar=bam&#=", "?foo=baz&#=!&bar=bam&#=", "foo&#=!&bar=bam&#", "?foo=baz&#=!&bar=bam&#" ] ) {
						const testee = template.replace( /#/g, version ).replace( /!/g, value );

						const filter = new Filter();
						( () => filter.processUrl( "", testee ) ).should.not.throw();
						filter.processUrl( "", testee ).should.equal( filter );

						filter.channel.should.be.ok();
					}
				}
			}
		}
	} );

	test( "detects any supported package format filter value as query parameter", function() {
		for ( let value of supportedFormats ) {
			for ( let name of [ "format", "archive" ] ) {
				for ( let version of [ name, name.toUpperCase(), encodeURIComponent( name ), encodeURIComponent( name.toUpperCase() ) ] ) {
					for ( let template of [ "#=!", "?#=!", "foo&#=!", "?foo=baz&#=!", "#=!&bar=bam", "?#=!&bar=bam", "foo&#=!&bar=bam", "?foo=baz&#=!&bar=bam", "foo&#=!&bar=bam&#=!", "?foo=baz&#=!&bar=bam&#=!", "foo&#=!&bar=bam&#=", "?foo=baz&#=!&bar=bam&#=", "foo&#=!&bar=bam&#", "?foo=baz&#=!&bar=bam&#" ] ) {
						const testee = template.replace( /#/g, version ).replace( /!/g, value );

						const filter = new Filter();
						( () => filter.processUrl( "", testee ) ).should.not.throw();
						filter.processUrl( "", testee ).should.equal( filter );

						filter.format.should.be.ok();
					}
				}
			}
		}
	} );

	test( "detects any supported mode filter value as query parameter", function() {
		for ( let value of supportedModes ) {
			for ( let name of ["mode"] ) {
				for ( let version of [ name, name.toUpperCase(), encodeURIComponent( name ), encodeURIComponent( name.toUpperCase() ) ] ) {
					for ( let template of [ "#=!", "?#=!", "foo&#=!", "?foo=baz&#=!", "#=!&bar=bam", "?#=!&bar=bam", "foo&#=!&bar=bam", "?foo=baz&#=!&bar=bam", "foo&#=!&bar=bam&#=!", "?foo=baz&#=!&bar=bam&#=!", "foo&#=!&bar=bam&#=", "?foo=baz&#=!&bar=bam&#=", "foo&#=!&bar=bam&#", "?foo=baz&#=!&bar=bam&#" ] ) {
						const testee = template.replace( /#/g, version ).replace( /!/g, value );

						const filter = new Filter();
						( () => filter.processUrl( "", testee ) ).should.not.throw();
						filter.processUrl( "", testee ).should.equal( filter );

						filter.mode.should.be.ok();
					}
				}
			}
		}
	} );
} );
