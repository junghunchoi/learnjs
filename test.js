var numWays = function(steps, arrLen) {
    const MOD = 10**9 + 7;
    const memo = new Map();

    const dp = (step, index) => {
        console.log(step, index);
        if (step === 0) {
            return index === 0 ? 1 : 0;
        }
        if (step < 0 || index < 0 || index >= arrLen) {
            return 0;
        }
        if (memo.has(`${step}-${index}`)) {
            return memo.get(`${step}-${index}`);
        }

        let ways = dp(step - 1, index) % MOD;
        ways += dp(step - 1, index - 1) % MOD;
        ways += dp(step - 1, index + 1) % MOD;

        memo.set(`${step}-${index}`, ways % MOD);
        return ways % MOD;
    };

    return dp(steps, 0);
};


console.log(numWays(3,2));