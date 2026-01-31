import dns from 'node:dns';

// Force IP family 4 for all DNS lookups to avoid IPv6 timeouts
const originalLookup = dns.lookup;
const originalResolveSrv = dns.resolveSrv;
const originalResolveTxt = dns.resolveTxt;

// Force Google Public DNS
const forcedServers = ['8.8.8.8', '8.8.4.4'];
try {
    dns.setServers(forcedServers);
    console.log(`✅ [DNS Patch] Forced Google DNS (${forcedServers.join(', ')})`);
} catch (e) {
    console.warn('⚠️ [DNS Patch] Failed to set custom DNS servers', e);
}

// Patch dns.lookup
// @ts-ignore
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    } else if (typeof options === 'number') {
        options = { family: 4 };
    } else if (!options) {
        options = {};
    }

    if (typeof options === 'object' && options !== null) {
        // @ts-ignore
        options.family = 4;
    }

    if (hostname.includes('mongodb.net')) {
        console.log(`🔍 [DNS Patch] Lookup: ${hostname}`);
    }

    // @ts-ignore
    return originalLookup(hostname, options, callback);
};

// Patch resolveSrv and resolveTxt (callback and promise versions)
const patchResolve = (obj: any, method: string, type: string) => {
    const original = obj[method];
    obj[method] = (...args: any[]) => {
        const hostname = args[0];
        if (hostname.includes('mongodb.net')) {
            console.log(`🔍 [DNS Patch] Resolving ${type} for: ${hostname}`);
        }
        return original.apply(obj, args);
    };
};

patchResolve(dns, 'resolveSrv', 'SRV');
patchResolve(dns, 'resolveTxt', 'TXT');
patchResolve(dns.promises, 'resolveSrv', 'SRV (Promise)');
patchResolve(dns.promises, 'resolveTxt', 'TXT (Promise)');

console.log('✅ [DNS Patch] Applied to Callback & Promise APIs');
