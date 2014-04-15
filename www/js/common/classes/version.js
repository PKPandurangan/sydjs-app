// Modified version of https://github.com/damien/semver-js to attach to window only

!function (root) {

  var Version = function () {
    this.major = arguments[0]
    this.minor = arguments[1]
    this.patch = arguments[2]
    this.pre   = arguments[3] || ""
    this.build = arguments[4] || ""
  }

  Version.prototype.parse = function () {
    if (typeof(arguments[0]) === "string") {
      // Parse a version string
      var versionString    = arguments[0],
          version          = versionString.split("."),
          prereleaseString = version[2],
          major            = version[0],
          minor            = version[1],
          chunks, patch, pre

      chunks = prereleaseString.split("-")

      if (chunks.length === 2) {
        patch = chunks[0]
        pre   = chunks[1]
      } else {
        patch = version[2]
        pre   = ""
      }

      return new Version(major, minor, patch, pre)


    } else if (typeof(arguments[0] === "object")) {
      // Parse an options object
      var opts = arguments[0]
      return new Version(opts.major, opts.minor, opts.patch, opts.pre, opts.build)

    } else {
      // Parse each argument as a version segment
      return new Version(
        arguments[0], // major
        arguments[1], // minor
        arguments[2], // patch
        arguments[3], // pre-release
        arguments[4]  // build
      )
    }
  }

  Version.prototype.toString = function () {
    var version = [this.major, this.minor, this.patch].join(".")

    if (this.pre) {
      version += "-" + this.pre
    }

    return version
  }

  Version.prototype.isValid = function () {
    var chunks = [this.major, this.minor, this.patch],
        pass = true, i

    for(i; i < chunks.length; i++) {
      // Pass if this chunk of the version is a number and is not NaN
      // Protip: comparing NaN to itself will return false.
      if (typeof(chunks[i]) !== "number" || chunks[i] !== chunks[i]) {
        pass = false
      }
    }

    return pass ? true : false;
  }

  // Attach to the window object.
  root.Version = Version

} (this)