const bucket = new WeakMap();

let activeEffect = null;

function isObject (value) {
    return typeof value === 'object' && value !== null;
}

function track (target, key) {
    if (!activeEffect) return;

    let depMap = bucket.get(target);
    if (!depMap) {
        depMap = new Map();
        bucket.set(target, depMap);
    }

    let depSet = depMap.get(target);

    // 如果bucket里面没有当前key（没有执行过当前的key）
    if (!depSet) {
        depSet = new Set();
        depMap.set(key, depSet);
    }

    // 已经创建了key的Set，保存一下副作用函数
    depSet.add(activeEffect);
}

function trigger (target, key) {
    let depMap = bucket.get(target);

    if (!depMap) return;

    // 从副作用函数桶中取出每一个元素并依次执行
    let depSet = depMap.get(key);
    if (depSet) {
        depSet.forEach(fn => fn());
    }
}

function reactive (data) {
    if (!isObject(data)) return;

    return new Proxy(data, {
        get (target, key) {
            console.log(`${ key }的get`);
            // 收集依赖
            track(target, key);
            return target[key];
        },
        set (target, key, value) {
            console.log(`${ key }的set`);
            target[key] = value;
            // set操作时，副作用函数重新执行
            trigger(target, key);
            return true;
        }
    });
}

// 注册副作用函数
function effect (fn) {
    if (typeof fn !== 'function') return;

    // 记录正在执行的副作用函数
    activeEffect = fn;

    // 调用副作用函数
    fn();

    // 重置全局变量
    activeEffect = null;
}
