// Logging utility function.
export default function trace(arg, location = '') {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(location + '-' + now + ': ', arg);
}
