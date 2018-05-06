> Jyve uses something kind of like release trains... but so far we don't really
> know when the train leaves the station. Whenever "enough stuff" is
> ready to be released, and we have enough time, the packages that have changed
> get bumped to the new version. This means some packages won't have some version
> numbers.

# 0.4.1

* started this changelog
* added integration test setup with Robot Framework, Selenium, and Firefox
* automated deploy of demo site to https://deathbeds.github.io/jyve
* Travis-CI

### @deathbeds/jyve

* iframes no longer consume dockpanel resizing events (#15)
* busy/idle kernel status is correctly updated in all kernels (#17)

# 0.4.0

### all packages

* Update minimum JupyterLab version to 0.32.0
