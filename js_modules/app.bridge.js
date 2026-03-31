function requireBridge(name, bridge) {
    if (!bridge) {
        throw new Error(`${name} bridge is not available`);
    }
    return bridge;
}

export function getDataBridge() {
    return requireBridge("Data", window.NtDataBridge);
}

export function getUiBridge() {
    return requireBridge("UI", window.NtUIBridge);
}
