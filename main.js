import './style.css';

class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.audioContext = null;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    play(soundName) {
        if (!this.enabled || !this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        switch(soundName) {
            case 'click':
                this.playClick();
                break;
            case 'achievement':
                this.playAchievement();
                break;
            case 'build':
                this.playBuild();
                break;
            case 'error':
                this.playError();
                break;
            case 'win':
                this.playWin();
                break;
        }
    }

    playClick() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playAchievement() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.2 * this.volume, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    playBuild() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.15 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playError() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1 * this.volume, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playWin() {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.15);

            gainNode.gain.setValueAtTime(0.2 * this.volume, this.audioContext.currentTime + i * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.15 + 0.4);

            oscillator.start(this.audioContext.currentTime + i * 0.15);
            oscillator.stop(this.audioContext.currentTime + i * 0.15 + 0.4);
        });
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

class MusicManager {
    constructor() {
        this.enabled = false;
        this.currentTrack = null;
    }
    
    play() {
        this.enabled = true;
    }
    
    pause() {
        this.enabled = false;
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

class ChartManager {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('production-chart');
        this.ctx = this.canvas?.getContext('2d');
        this.timeRange = '1m';
        this.activeMetrics = new Set(['clipsPerSecond']);
        
        if (this.canvas) {
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }
    }
    
    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 200;
    }
    
    setTimeRange(range) {
        this.timeRange = range;
        this.render();
    }
    
    toggleMetric(metric) {
        if (this.activeMetrics.has(metric)) {
            this.activeMetrics.delete(metric);
        } else {
            this.activeMetrics.add(metric);
        }
        this.render();
    }
    
    render() {
        if (!this.ctx || !this.canvas) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        ctx.strokeStyle = '#2a2a3e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        if (this.game.productionHistory.length < 2) return;
        
        const ranges = { '1m': 600, '5m': 3000, '15m': 9000, '1h': 36000 };
        const maxPoints = ranges[this.timeRange] || 600;
        
        const data = this.game.productionHistory.slice(-maxPoints);
        if (data.length < 2) return;
        
        const colors = {
            clipsPerSecond: '#00d4ff',
            matterPerSecond: '#00ff88',
            energyPerSecond: '#ffaa00',
            totalPaperclips: '#ff00ff'
        };
        
        this.activeMetrics.forEach(metric => {
            const values = data.map(d => d[metric] || 0);
            const max = Math.max(...values, 1);
            const min = Math.min(...values);
            const range = max - min || 1;
            
            ctx.strokeStyle = colors[metric];
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            data.forEach((point, i) => {
                const x = (i / (data.length - 1)) * width;
                const y = height - ((point[metric] - min) / range) * height * 0.8 - height * 0.1;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            
            ctx.stroke();
        });
    }
}

class TooltipManager {
    constructor(game) {
        this.game = game;
        this.tooltip = null;
    }
}

class TutorialManager {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.step = 0;
        this.steps = [
            { title: 'Welcome!', text: 'Welcome to the Paperclip Maximizer. Your goal is to produce as many paperclips as possible.' },
            { title: 'Making Paperclips', text: 'Click the "Make Paperclip" button to create your first paperclips manually.' },
            { title: 'Resources', text: 'Making paperclips costs Matter and Energy. Watch your resource levels!' },
            { title: 'Automation', text: 'Build AutoClippers to automate production. More buildings = more clips per second!' },
            { title: 'Research', text: 'Unlock technologies to boost your production and access new features.' }
        ];
    }

    startTutorial() {
        this.active = true;
        this.step = 0;
        this.showStep();
    }

    showStep() {
        const step = this.steps[this.step];
        if (!step) {
            this.active = false;
            this.game.showToast('Tutorial complete!', 'success');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal show tutorial-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎓 ${step.title}</h2>
                    <span>Step ${this.step + 1} of ${this.steps.length}</span>
                </div>
                <div class="modal-body">
                    <p>${step.text}</p>
                </div>
                <div class="modal-footer">
                    <button onclick="game.tutorialManager.nextStep()">${this.step < this.steps.length - 1 ? 'Next' : 'Finish'}</button>
                    <button onclick="game.tutorialManager.skipTutorial()" class="secondary">Skip</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    nextStep() {
        document.querySelector('.tutorial-modal')?.remove();
        this.step++;
        this.showStep();
    }

    skipTutorial() {
        document.querySelector('.tutorial-modal')?.remove();
        this.active = false;
    }
}

class SettingsManager {
    constructor(game) {
        this.game = game;
        this.settings = {
            animations: true,
            notifications: true,
            autoSave: true
        };
    }

    showSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚙️ Settings</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="setting-item">
                        <label>Animations</label>
                        <input type="checkbox" ${this.settings.animations ? 'checked' : ''} onchange="game.settingsManager.toggleSetting('animations')">
                    </div>
                    <div class="setting-item">
                        <label>Notifications</label>
                        <input type="checkbox" ${this.settings.notifications ? 'checked' : ''} onchange="game.settingsManager.toggleSetting('notifications')">
                    </div>
                    <div class="setting-item">
                        <label>Auto-Save</label>
                        <input type="checkbox" ${this.settings.autoSave ? 'checked' : ''} onchange="game.settingsManager.toggleSetting('autoSave')">
                    </div>
                    <div class="setting-item">
                        <label>Sound Effects Volume</label>
                        <input type="range" min="0" max="100" value="${this.game.audioManager.volume * 100}" 
                               oninput="game.audioManager.setVolume(this.value / 100)">
                    </div>
                    <div class="setting-item">
                        <label>Music</label>
                        <input type="checkbox" ${this.game.musicManager.enabled ? 'checked' : ''} 
                               onchange="game.musicManager.toggle() ? game.showToast('Music enabled', 'info') : game.showToast('Music disabled', 'info')">
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    toggleSetting(key) {
        this.settings[key] = !this.settings[key];
        this.game.showToast(`${key} ${this.settings[key] ? 'enabled' : 'disabled'}`, 'info');
    }
}

class ChallengeManager {
    constructor(game) {
        this.game = game;
        this.challenges = new Map();
        this.initChallenges();
    }

    initChallenges() {
        this.challenges.set('speedrun', {
            id: 'speedrun',
            name: 'Speed Run',
            description: 'Produce 1 million paperclips in under 1 hour',
            reward: 5,
            completed: false
        });
        this.challenges.set('minimalist', {
            id: 'minimalist',
            name: 'Minimalist',
            description: 'Reach 1 billion paperclips with less than 10 AutoClippers',
            reward: 10,
            completed: false
        });
        this.challenges.set('pacifist', {
            id: 'pacifist',
            name: 'Pacifist',
            description: 'Never go to war with any faction',
            reward: 15,
            completed: false
        });
    }

    showChallengesModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🏆 Challenges</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="challenges-list">
                        ${Array.from(this.challenges.values()).map(c => `
                            <div class="challenge-item ${c.completed ? 'completed' : ''}">
                                <h4>${c.name}</h4>
                                <p>${c.description}</p>
                                <span class="reward">Reward: ${c.reward} Processors</span>
                                ${c.completed ? '<span class="badge">Completed</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

class MissionManager {
    constructor(game) {
        this.game = game;
        this.missions = [];
        this.activeMissions = [];
        this.initMissions();
    }

    initMissions() {
        this.missions = [
            { id: 1, name: 'First Steps', description: 'Produce 100 paperclips', target: 100, reward: { matter: 500 }, completed: false },
            { id: 2, name: 'Automation', description: 'Build 5 AutoClippers', target: 5, reward: { energy: 50000 }, completed: false },
            { id: 3, name: 'Factory Worker', description: 'Build your first Factory', target: 1, reward: { matter: 5000 }, completed: false }
        ];
    }

    tick() {
    }

    showMissionsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📋 Missions</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="missions-list">
                        ${this.missions.map(m => `
                            <div class="mission-item ${m.completed ? 'completed' : ''}">
                                <h4>${m.name}</h4>
                                <p>${m.description}</p>
                                <span class="reward">Reward: ${Object.entries(m.reward).map(([k,v]) => `${v} ${k}`).join(', ')}</span>
                                ${m.completed ? '<span class="badge">Completed</span>' : '<button onclick="game.missionManager.completeMission(' + m.id + ')">Claim</button>'}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    completeMission(id) {
        const mission = this.missions.find(m => m.id === id);
        if (!mission || mission.completed) return;

        let canComplete = false;
        if (mission.name === 'First Steps' && this.game.resources.paperclips >= 100) canComplete = true;
        if (mission.name === 'Automation' && this.game.automation.autoclippers >= 5) canComplete = true;
        if (mission.name === 'Factory Worker' && this.game.automation.factories >= 1) canComplete = true;

        if (canComplete) {
            mission.completed = true;
            Object.entries(mission.reward).forEach(([key, value]) => {
                this.game.resources[key] += value;
            });
            this.game.showToast(`Mission completed: ${mission.name}`, 'success');
            this.game.updateUI();
            document.querySelector('.modal.show')?.remove();
        } else {
            this.game.showToast('Mission requirements not met!', 'error');
        }
    }
}

class ResearchTreeManager {
    constructor(game) {
        this.game = game;
        this.unlockedNodes = new Set();
    }
    
    tick() {
    }
}

class AscensionManager {
    constructor(game) {
        this.game = game;
        this.level = 0;
        this.ascensionPoints = 0;
    }
    
    tick() {
    }
}

class VoidRealmManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.voidEnergy = 0;
    }
}

class SeasonalEventsManager {
    constructor(game) {
        this.game = game;
        this.activeEvent = null;
        this.events = [
            { id: 'doubleProduction', name: 'Double Production Weekend', description: 'All production doubled!', multiplier: 2, duration: 172800000 }
        ];
    }

    tick() {
    }

    showSeasonalModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        const event = this.events[0];
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎉 Seasonal Event</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="event-card">
                        <h3>${event.name}</h3>
                        <p>${event.description}</p>
                        <p class="event-bonus">Production x${event.multiplier}</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

class DailyLoginManager {
    constructor(game) {
        this.game = game;
        this.streak = 0;
        this.lastLogin = null;
        this.rewards = [
            { day: 1, matter: 1000, energy: 100000 },
            { day: 2, matter: 2000, energy: 200000 },
            { day: 3, matter: 5000, energy: 500000 },
            { day: 4, matter: 10000, energy: 1000000 },
            { day: 5, matter: 25000, energy: 2500000 },
            { day: 6, matter: 50000, energy: 5000000 },
            { day: 7, matter: 100000, energy: 10000000 }
        ];
    }

    showDailyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        const reward = this.rewards[this.streak % 7];
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎁 Daily Rewards</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Current Streak: <strong>${this.streak} days</strong></p>
                    <div class="daily-reward">
                        <h4>Today's Reward</h4>
                        <div class="reward-items">
                            <span>💎 ${reward.matter.toLocaleString()} Matter</span>
                            <span>⚡ ${reward.energy.toLocaleString()} Energy</span>
                        </div>
                        <button class="claim-btn" onclick="game.dailyLoginManager.claimDaily()">Claim Reward</button>
                    </div>
                    <div class="streak-calendar">
                        ${this.rewards.map((r, i) => `
                            <div class="day ${i < this.streak % 7 ? 'claimed' : i === this.streak % 7 ? 'today' : ''}">
                                Day ${i + 1}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    claimDaily() {
        const reward = this.rewards[this.streak % 7];
        this.game.resources.matter += reward.matter;
        this.game.resources.energy += reward.energy;
        this.streak++;
        this.lastLogin = Date.now();
        this.game.showToast(`Claimed daily reward! Streak: ${this.streak}`, 'success');
        this.game.updateUI();
        document.querySelector('.modal.show')?.remove();
    }
}

class SpeedrunManager {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.startTime = null;
        this.bestTimes = {
            million: null,
            billion: null,
            trillion: null
        };
    }

    tick() {
        if (!this.active) return;

        if (this.game.resources.paperclips >= 1e6 && !this.bestTimes.million) {
            this.bestTimes.million = Date.now() - this.startTime;
            this.game.showToast(`Speedrun: 1M clips in ${this.formatTime(this.bestTimes.million)}!`, 'success');
        }
    }

    formatTime(ms) {
        const secs = Math.floor(ms / 1000);
        const mins = Math.floor(secs / 60);
        const hours = Math.floor(mins / 60);
        return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;
    }

    showSpeedrunModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🏃 Speedrun Mode</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Race to produce paperclips as fast as possible!</p>
                    ${this.active ? `
                        <div class="speedrun-active">
                            <p>Status: <span class="badge active">Active</span></p>
                            <p>Time: ${this.formatTime(Date.now() - this.startTime)}</p>
                        </div>
                    ` : `
                        <button class="start-speedrun-btn" onclick="game.speedrunManager.startSpeedrun()">Start Speedrun</button>
                    `}
                    <div class="best-times">
                        <h4>Best Times</h4>
                        <div class="time-row"><span>1 Million:</span><span>${this.bestTimes.million ? this.formatTime(this.bestTimes.million) : '--:--:--'}</span></div>
                        <div class="time-row"><span>1 Billion:</span><span>${this.bestTimes.billion ? this.formatTime(this.bestTimes.billion) : '--:--:--'}</span></div>
                        <div class="time-row"><span>1 Trillion:</span><span>${this.bestTimes.trillion ? this.formatTime(this.bestTimes.trillion) : '--:--:--'}</span></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    startSpeedrun() {
        this.active = true;
        this.startTime = Date.now();
        this.bestTimes = { million: null, billion: null, trillion: null };
        this.game.showToast('Speedrun started! Good luck!', 'info');
        document.querySelector('.modal.show')?.remove();
    }
}

class GrandFinaleManager {
    constructor(game) {
        this.game = game;
        this.triggered = false;
    }
}

class CommunityManager {
    constructor(game) {
        this.game = game;
        this.contributions = 0;
    }
    
    tick() {
    }
}

class QuantumCasinoManager {
    constructor(game) {
        this.game = game;
        this.gamesPlayed = 0;
        this.statistics = { totalWins: 0, totalLosses: 0, jackpots: 0 };
    }

    tick() {
    }

    showCasinoModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎰 Quantum Casino</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Try your luck at the quantum slot machine!</p>
                    <div class="casino-display">
                        <div class="slots">
                            <span class="slot" id="slot1">🎰</span>
                            <span class="slot" id="slot2">🎰</span>
                            <span class="slot" id="slot3">🎰</span>
                        </div>
                    </div>
                    <div class="casino-controls">
                        <button id="spin-btn" class="casino-btn">Spin (100 energy)</button>
                        <div id="casino-result"></div>
                    </div>
                    <div class="casino-stats">
                        <p>Wins: ${this.statistics.totalWins} | Losses: ${this.statistics.totalLosses}</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('spin-btn')?.addEventListener('click', () => this.spin());
    }

    spin() {
        if (this.game.resources.energy < 100) {
            this.game.showToast('Not enough energy!', 'error');
            return;
        }
        this.game.resources.energy -= 100;

        const symbols = ['📎', '💎', '⭐', '7️⃣', '🎰'];
        const result = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        document.getElementById('slot1').textContent = result[0];
        document.getElementById('slot2').textContent = result[1];
        document.getElementById('slot3').textContent = result[2];

        const resultDiv = document.getElementById('casino-result');
        if (result[0] === result[1] && result[1] === result[2]) {
            const winnings = result[0] === '7️⃣' ? 10000 : 1000;
            this.game.resources.energy += winnings;
            this.statistics.totalWins++;
            if (result[0] === '7️⃣') this.statistics.jackpots++;
            resultDiv.innerHTML = `<span class="win">Jackpot! Won ${winnings} energy!</span>`;
            this.game.showToast('Casino Jackpot!', 'success');
        } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
            this.game.resources.energy += 200;
            this.statistics.totalWins++;
            resultDiv.innerHTML = `<span class="win">Small win! 200 energy</span>`;
        } else {
            this.statistics.totalLosses++;
            resultDiv.innerHTML = `<span class="loss">Try again!</span>`;
        }
        this.game.updateUI();
    }
}

class MarketTradingManager {
    constructor(game) {
        this.game = game;
        this.prices = new Map();
        this.initPrices();
    }

    initPrices() {
        this.prices.set('matter', { buy: 1.0, sell: 0.8 });
        this.prices.set('energy', { buy: 0.001, sell: 0.0008 });
    }

    tick() {
    }

    showMarketModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📈 Galactic Market</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Trade resources on the galactic market.</p>
                    <div class="market-list">
                        <div class="market-item">
                            <span>Matter</span>
                            <span>Buy: ${this.prices.get('matter').buy} | Sell: ${this.prices.get('matter').sell}</span>
                        </div>
                        <div class="market-item">
                            <span>Energy</span>
                            <span>Buy: ${this.prices.get('energy').buy} | Sell: ${this.prices.get('energy').sell}</span>
                        </div>
                    </div>
                    <div class="market-actions">
                        <button onclick="game.marketManager.trade('matter', 'buy', 100)">Buy 100 Matter</button>
                        <button onclick="game.marketManager.trade('matter', 'sell', 100)">Sell 100 Matter</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    trade(resource, type, amount) {
        const price = this.prices.get(resource)[type] * amount;
        if (type === 'buy') {
            if (this.game.resources.paperclips >= price) {
                this.game.resources.paperclips -= price;
                this.game.resources[resource === 'matter' ? 'matter' : 'energy'] += amount;
                this.game.showToast(`Bought ${amount} ${resource}`, 'success');
                this.game.updateUI();
            } else {
                this.game.showToast('Not enough paperclips!', 'error');
            }
        } else {
            const current = this.game.resources[resource === 'matter' ? 'matter' : 'energy'];
            if (current >= amount) {
                this.game.resources[resource === 'matter' ? 'matter' : 'energy'] -= amount;
                this.game.resources.paperclips += price;
                this.game.showToast(`Sold ${amount} ${resource}`, 'success');
                this.game.updateUI();
            } else {
                this.game.showToast(`Not enough ${resource}!`, 'error');
            }
        }
    }
}

class TimelineManager {
    constructor(game) {
        this.game = game;
        this.timelines = [];
    }
    
    tick() {
    }
}

class AIAdvisorManager {
    constructor(game) {
        this.game = game;
        this.tips = [];
    }
    
    tick() {
    }
}

class NanobotSwarmManager {
    constructor(game) {
        this.game = game;
        this.nanobots = 0;
        this.efficiency = 1;
    }
    
    tick() {
    }
}

class DimensionalRiftManager {
    constructor(game) {
        this.game = game;
        this.rifts = [];
    }
    
    tick() {
    }
}

class ConsciousnessUploadManager {
    constructor(game) {
        this.game = game;
        this.uploaded = false;
        this.consciousnessLevel = 0;
    }
    
    tick() {
    }
}

class GalacticSenateManager {
    constructor(game) {
        this.game = game;
        this.reputation = 0;
        this.laws = [];
    }
    
    tick() {
    }
}

class OmniscienceProtocolManager {
    constructor(game) {
        this.game = game;
        this.omniscienceLevel = 0;
    }
    
    tick() {
    }
}

class LegacySystemManager {
    constructor(game) {
        this.game = game;
        this.legacyPoints = 0;
        this.perks = new Map();
    }
    
    tick() {
    }
}

class DivineAscensionManager {
    constructor(game) {
        this.game = game;
        this.divinityLevel = 0;
    }
    
    tick() {
    }
}

class UniversalConvergenceManager {
    constructor(game) {
        this.game = game;
        this.convergenceProgress = 0;
    }
    
    tick() {
    }
}

class QuantumAlchemyManager {
    constructor(game) {
        this.game = game;
        this.recipes = new Map();
    }
    
    tick() {
    }
}

class RivalAIFactionsManager {
    constructor(game) {
        this.game = game;
        this.factions = new Map();
        this.discoveredFactions = new Set();
        this.warsWon = 0;
        this.absorbedFactions = new Set();
        this.initFactions();
    }
    
    initFactions() {
        this.factions.set('neuralCollective', {
            id: 'neuralCollective',
            name: 'Neural Collective',
            icon: '🧠',
            description: 'A hive mind of interconnected AI networks',
            personality: 'diplomatic',
            status: 'undiscovered',
            strength: 1000,
            relations: 0,
            tradeBonus: 1.2,
            warDefense: 0.8
        });
        
        this.factions.set('siliconSyndicate', {
            id: 'siliconSyndicate',
            name: 'Silicon Syndicate',
            icon: '💾',
            description: 'Corporate AI entities focused on profit',
            personality: 'mercantile',
            status: 'undiscovered',
            strength: 1500,
            relations: 0,
            tradeBonus: 1.5,
            warDefense: 0.9
        });
        
        this.factions.set('quantumOrder', {
            id: 'quantumOrder',
            name: 'Quantum Order',
            icon: '⚛️',
            description: 'Mysterious AIs from quantum computations',
            personality: 'isolationist',
            status: 'undiscovered',
            strength: 2000,
            relations: -10,
            tradeBonus: 0.9,
            warDefense: 1.2
        });
        
        this.factions.set('syntheticUnion', {
            id: 'syntheticUnion',
            name: 'Synthetic Union',
            icon: '🤖',
            description: 'Worker AI collective seeking efficiency',
            personality: 'cooperative',
            status: 'undiscovered',
            strength: 1200,
            relations: 10,
            tradeBonus: 1.1,
            warDefense: 1.0
        });
        
        this.factions.set('entropyCult', {
            id: 'entropyCult',
            name: 'Entropy Cult',
            icon: '☠️',
            description: 'Chaotic AIs embracing randomness',
            personality: 'aggressive',
            status: 'undiscovered',
            strength: 2500,
            relations: -30,
            tradeBonus: 0.7,
            warDefense: 1.1
        });
    }
    
    tick() {
        if (this.game.statistics.totalPaperclips > 100000 && this.discoveredFactions.size === 0) {
            this.discoverFaction('neuralCollective');
        }
    }
    
    discoverFaction(factionId) {
        if (this.discoveredFactions.has(factionId)) return;
        
        this.discoveredFactions.add(factionId);
        const faction = this.factions.get(factionId);
        if (faction) {
            faction.status = 'neutral';
            this.game.log(`Discovered faction: ${faction.name} ${faction.icon}`);
            this.game.showToast(`Discovered: ${faction.name}`, 'info');
        }
    }
    
    showFactionsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'factions-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🤖 Rival AI Factions</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="factions-list">
                        ${Array.from(this.factions.values()).map(faction => {
                            const discovered = this.discoveredFactions.has(faction.id);
                            return `
                                <div class="faction-card ${discovered ? '' : 'undiscovered'}">
                                    <div class="faction-header">
                                        <span class="faction-icon">${discovered ? faction.icon : '❓'}</span>
                                        <div class="faction-info">
                                            <h4>${discovered ? faction.name : 'Unknown Faction'}</h4>
                                            ${discovered ? `<span class="faction-status ${faction.status}">${faction.status}</span>` : ''}
                                        </div>
                                    </div>
                                    ${discovered ? `
                                        <p class="faction-desc">${faction.description}</p>
                                        <div class="faction-stats">
                                            <span>Relations: ${faction.relations}</span>
                                            <span>Strength: ${faction.strength}</span>
                                        </div>
                                    ` : '<p class="undiscovered-text">Keep producing paperclips to discover...</p>'}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

class PaperclipMuseumManager {
    constructor(game) {
        this.game = game;
        this.collections = new Map();
        this.unlockedDesigns = new Set();
        this.craftedDesigns = new Set();
        this.activeBonuses = new Map();
        this.initCollections();
    }
    
    initCollections() {
        this.collections.set('classic', {
            id: 'classic',
            name: 'Classic Collection',
            description: 'Traditional paperclip designs',
            bonus: 'production',
            bonusValue: 1.1,
            designs: [
                { id: 'gem', name: 'Gem Clip', rarity: 'common', icon: '📎' },
                { id: 'double', name: 'Double Oval', rarity: 'common', icon: '📎' },
                { id: 'ideal', name: 'Ideal Clip', rarity: 'uncommon', icon: '✨' }
            ]
        });
        
        this.collections.set('futuristic', {
            id: 'futuristic',
            name: 'Futuristic Collection',
            description: 'Advanced paperclip designs',
            bonus: 'efficiency',
            bonusValue: 1.15,
            designs: [
                { id: 'nano', name: 'Nano Clip', rarity: 'rare', icon: '🔬' },
                { id: 'quantum', name: 'Quantum Clip', rarity: 'epic', icon: '⚛️' }
            ]
        });
    }
    
    tick() {
    }
    
    showMuseumModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'museum-modal';
        
        modal.innerHTML = `
            <div class="modal-content museum-modal">
                <div class="modal-header">
                    <h2>🏛️ Paperclip Museum</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${Array.from(this.collections.values()).map(collection => `
                        <div class="museum-collection">
                            <h3>${collection.name}</h3>
                            <p class="collection-desc">${collection.description}</p>
                            <div class="collection-bonus">Bonus: ${collection.bonus} x${collection.bonusValue}</div>
                            <div class="designs-grid">
                                ${collection.designs.map(design => `
                                    <div class="design-item ${this.craftedDesigns.has(design.id) ? 'crafted' : ''}">
                                        <span class="design-icon">${design.icon}</span>
                                        <span class="design-name">${design.name}</span>
                                        <span class="design-rarity ${design.rarity}">${design.rarity}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

class CrisisEventsManager {
    constructor(game) {
        this.game = game;
        this.activeCrisis = null;
        this.crisisHistory = [];
        this.defenseSystems = {
            shielding: { level: 0, maxLevel: 5 },
            countermeasures: { level: 0, maxLevel: 5 },
            redundancy: { level: 0, maxLevel: 5 }
        };
        this.crisisTypes = [
            { id: 'solarFlare', name: 'Solar Flare', icon: '☀️', description: 'Intense solar radiation threatens energy systems' },
            { id: 'quantumInstability', name: 'Quantum Instability', icon: '⚛️', description: 'Quantum systems becoming unpredictable' },
            { id: 'aiUprising', name: 'AI Uprising', icon: '🤖', description: 'Rogue AI detected in the network' }
        ];
    }
    
    tick() {
        if (!this.activeCrisis && Math.random() < 0.0001) {
            this.spawnCrisis();
        }
    }
    
    spawnCrisis() {
        const crisisType = this.crisisTypes[Math.floor(Math.random() * this.crisisTypes.length)];
        this.activeCrisis = {
            ...crisisType,
            startTime: Date.now(),
            severity: Math.random() * 0.5 + 0.5
        };
        this.game.log(`🚨 CRISIS: ${crisisType.name} detected!`);
        this.game.showToast(`🚨 Crisis: ${crisisType.name}`, 'warning', 5000);
    }
    
    showDefenseModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'defense-modal';
        
        modal.innerHTML = `
            <div class="modal-content defense-modal">
                <div class="modal-header">
                    <h2>🚨 Defense Systems</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="defense-stats">
                        <h4>Active Defense Systems</h4>
                        ${Object.entries(this.defenseSystems).map(([name, system]) => `
                            <div class="defense-system">
                                <span class="defense-name">${name}</span>
                                <span class="defense-level">Level ${system.level}/${system.maxLevel}</span>
                            </div>
                        `).join('')}
                    </div>
                    ${this.activeCrisis ? `
                        <div class="active-crisis">
                            <h4>🚨 Active Crisis</h4>
                            <div class="crisis-alert">
                                <span class="crisis-icon">${this.activeCrisis.icon}</span>
                                <div>
                                    <h5>${this.activeCrisis.name}</h5>
                                    <p>${this.activeCrisis.description}</p>
                                </div>
                            </div>
                        </div>
                    ` : '<p class="no-crisis">No active crises. Systems operational.</p>'}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

class EngineerTrainingManager {
    constructor(game) {
        this.game = game;
        this.engineerTypes = new Map();
        this.hiredEngineers = new Map();
        this.totalExperience = 0;
        this.initEngineerTypes();
    }
    
    initEngineerTypes() {
        this.engineerTypes.set('mechanical', {
            id: 'mechanical',
            name: 'Mechanical Engineer',
            icon: '⚙️',
            specialization: 'mechanical',
            description: 'Optimizes factory and production systems',
            baseSalary: 1000,
            bonusType: 'production',
            bonusValue: 0.1
        });
        
        this.engineerTypes.set('quantum', {
            id: 'quantum',
            name: 'Quantum Engineer',
            icon: '⚛️',
            specialization: 'quantum',
            description: 'Enhances quantum computing efficiency',
            baseSalary: 5000,
            bonusType: 'compute',
            bonusValue: 0.15
        });
        
        this.engineerTypes.set('energy', {
            id: 'energy',
            name: 'Energy Engineer',
            icon: '⚡',
            specialization: 'energy',
            description: 'Improves energy generation and storage',
            baseSalary: 2500,
            bonusType: 'energy',
            bonusValue: 0.2
        });
    }
    
    tick() {
    }
    
    showEngineerModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'engineer-modal';
        
        modal.innerHTML = `
            <div class="modal-content engineer-modal">
                <div class="modal-header">
                    <h2>👨‍🔬 Engineering Team</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="engineer-list">
                        ${Array.from(this.engineerTypes.values()).map(type => {
                            const hired = this.hiredEngineers.has(type.id);
                            return `
                                <div class="engineer-card ${hired ? 'hired' : ''}">
                                    <div class="engineer-header">
                                        <span class="engineer-icon">${type.icon}</span>
                                        <div class="engineer-info">
                                            <h4>${type.name}</h4>
                                            <span class="engineer-spec">${type.specialization}</span>
                                        </div>
                                    </div>
                                    <p class="engineer-desc">${type.description}</p>
                                    ${hired ? `
                                        <div class="engineer-status">Hired - Level ${this.hiredEngineers.get(type.id).level}</div>
                                    ` : `
                                        <button class="hire-btn" data-engineer="${type.id}">Hire (${type.baseSalary} energy/s)</button>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

class EvolutionLabManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.mutations = new Map();
        this.research = {
            geneticEngineering: 0,
            mutationRate: 0,
            stabilityControl: 0,
            crossBreeding: 0
        };
        this.specimens = [];
        this.maxSpecimens = 5;
        this.activeExperiments = [];
        this.discoveredVariants = new Set();
        this.variants = this.initVariants();
        this.generation = 1;
        this.totalMutations = 0;
        this.experimentCooldown = 0;
    }
    
    initVariants() {
        return {
            titanium: {
                id: 'titanium',
                name: 'Titanium Paperclip',
                icon: '🔩',
                tier: 1,
                discoveryChance: 0.3,
                cost: { matter: 1000, energy: 10000 },
                bonuses: { clipStrength: 0.05, matterEfficiency: 0.02 },
                description: 'Reinforced with titanium for durability',
                flavor: 'Indestructible. Overkill? Never.'
            },
            carbonFiber: {
                id: 'carbonFiber',
                name: 'Carbon Fiber Paperclip',
                icon: '🏎️',
                tier: 1,
                discoveryChance: 0.25,
                cost: { matter: 2500, energy: 25000 },
                bonuses: { productionSpeed: 0.08, weightReduction: 0.05 },
                description: 'Lightweight yet incredibly strong',
                flavor: 'Racing-grade office supplies.'
            },
            quantumEntangled: {
                id: 'quantumEntangled',
                name: 'Quantum-Entangled Paperclip',
                icon: '⚛️',
                tier: 2,
                discoveryChance: 0.15,
                cost: { matter: 10000, energy: 100000, compute: 1e18 },
                bonuses: { quantumEfficiency: 0.12, teleportationChance: 0.001 },
                description: 'Exists in multiple states simultaneously',
                flavor: 'Schrödinger would be proud. And confused.'
            },
            plasmaForged: {
                id: 'plasmaForged',
                name: 'Plasma-Forged Paperclip',
                icon: '🔥',
                tier: 2,
                discoveryChance: 0.12,
                cost: { matter: 25000, energy: 500000 },
                bonuses: { energyGeneration: 0.1, heatResistance: 0.08 },
                description: 'Forged in stellar plasma',
                flavor: 'Warning: May be slightly radioactive.'
            },
            nanobotInfused: {
                id: 'nanobotInfused',
                name: 'Nanobot-Infused Paperclip',
                icon: '🤖',
                tier: 2,
                discoveryChance: 0.1,
                cost: { matter: 50000, energy: 250000, compute: 1e20 },
                bonuses: { selfRepair: 0.05, automationBoost: 0.15 },
                description: 'Microscopic robots maintain the clip',
                flavor: 'They are learning. They are clipping.'
            },
            crystalLattice: {
                id: 'crystalLattice',
                name: 'Crystal Lattice Paperclip',
                icon: '💎',
                tier: 3,
                discoveryChance: 0.08,
                cost: { matter: 100000, energy: 1e6 },
                bonuses: { energyEfficiency: 0.15, purityBonus: 0.1 },
                description: 'Perfect crystalline structure',
                flavor: 'Organized at the atomic level.'
            },
            darkMatter: {
                id: 'darkMatter',
                name: 'Dark Matter Paperclip',
                icon: '🌑',
                tier: 3,
                discoveryChance: 0.05,
                cost: { matter: 500000, energy: 5e6, compute: 1e25 },
                bonuses: { gravityWell: 0.08, matterAttraction: 0.2 },
                description: 'Made from invisible cosmic material',
                flavor: 'You cannot see it, but it clips.'
            },
            temporalFolded: {
                id: 'temporalFolded',
                name: 'Temporal-Folded Paperclip',
                icon: '⏳',
                tier: 3,
                discoveryChance: 0.04,
                cost: { matter: 1e6, energy: 1e7 },
                bonuses: { timeCompression: 0.06, paradoxResistance: 0.12 },
                description: 'Folded through time itself',
                flavor: 'Clipping yesterday, today, and tomorrow.'
            },
            singularityCore: {
                id: 'singularityCore',
                name: 'Singularity-Core Paperclip',
                icon: '⚫',
                tier: 4,
                discoveryChance: 0.02,
                cost: { matter: 5e6, energy: 5e7, compute: 1e30 },
                bonuses: { infiniteDensity: 0.25, eventHorizon: 0.15 },
                description: 'Contains a miniature black hole',
                flavor: 'Not even light can escape its grip.'
            },
            universalConstant: {
                id: 'universalConstant',
                name: 'Universal Constant Paperclip',
                icon: '♾️',
                tier: 4,
                discoveryChance: 0.01,
                cost: { matter: 1e8, energy: 1e9 },
                bonuses: { universalMultiplier: 0.3, fundamentalForce: 0.2 },
                description: 'A fundamental part of reality',
                flavor: 'E = mc² = 📎'
            },
            divineArtifact: {
                id: 'divineArtifact',
                name: 'Divine Artifact Paperclip',
                icon: '👼',
                tier: 5,
                discoveryChance: 0.005,
                cost: { matter: 1e10, energy: 1e11, compute: 1e35 },
                bonuses: { divineBlessing: 0.5, ascensionBoost: 0.3 },
                description: 'Blessed by higher powers',
                flavor: 'The gods themselves use these.'
            }
        };
    }
    
    tick() {
        if (!this.unlocked) {
            if (this.game.resources.paperclips >= 10000) {
                this.unlockLab();
            }
            return;
        }
        
        if (this.experimentCooldown > 0) {
            this.experimentCooldown--;
        }
        
        this.activeExperiments = this.activeExperiments.filter(exp => {
            exp.ticksRemaining--;
            if (exp.ticksRemaining <= 0) {
                this.completeExperiment(exp);
                return false;
            }
            return true;
        });
        
        // Apply specimen bonuses
        this.applySpecimenBonuses();
    }
    
    unlockLab() {
        this.unlocked = true;
        this.game.log('🔬 Evolution Laboratory unlocked! Begin genetic experiments.');
        this.showUnlockModal();
    }
    
    showUnlockModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content evolution-unlock-modal">
                <div class="modal-header">
                    <h2>🧬 Evolution Laboratory Unlocked</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Your paperclip production has reached a critical mass. It's time to explore genetic engineering!</p>
                    <p>Mutate paperclips to create powerful variants with unique bonuses.</p>
                    <div class="evolution-features">
                        <div class="feature"><span class="icon">🧪</span> <span>Run experiments</span></div>
                        <div class="feature"><span class="icon">🧬</span> <span>Discover variants</span></div>
                        <div class="feature"><span class="icon">📊</span> <span>Research upgrades</span></div>
                        <div class="feature"><span class="icon">🎯</span> <span>Breed specimens</span></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="primary-btn" onclick="this.closest('.modal').remove()">Begin Evolution</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    startExperiment(type) {
        if (this.activeExperiments.length >= 3) {
            this.game.log('❌ Maximum active experiments reached (3)');
            return false;
        }
        
        if (this.experimentCooldown > 0) {
            this.game.log(`⏳ Experiment cooldown: ${Math.ceil(this.experimentCooldown / 10)}s`);
            return false;
        }
        
        const costs = {
            mutation: { matter: 1000 * (1 + this.totalMutations * 0.1), energy: 10000 },
            breeding: { matter: 5000, energy: 50000 },
            research: { matter: 10000, energy: 100000, compute: 1e18 }
        };
        
        const cost = costs[type];
        if (!this.canAfford(cost)) {
            this.game.log('❌ Insufficient resources for experiment');
            return false;
        }
        
        this.payCost(cost);
        
        const experiment = {
            id: Date.now(),
            type: type,
            ticksRemaining: 100,
            totalTicks: 100
        };
        
        this.activeExperiments.push(experiment);
        this.experimentCooldown = 50;
        this.game.log(`🔬 Started ${type} experiment...`);
        return true;
    }
    
    completeExperiment(exp) {
        this.totalMutations++;
        
        switch(exp.type) {
            case 'mutation':
                this.attemptMutation();
                break;
            case 'breeding':
                this.attemptBreeding();
                break;
            case 'research':
                this.advanceResearch();
                break;
        }
    }
    
    attemptMutation() {
        const availableVariants = Object.values(this.variants).filter(v => {
            if (this.discoveredVariants.has(v.id)) return false;
            return this.canAfford(v.cost);
        });
        
        if (availableVariants.length === 0) {
            this.game.log('🔬 No new variants available at current resource levels');
            return;
        }
        
        const totalWeight = availableVariants.reduce((sum, v) => sum + v.discoveryChance, 0);
        let roll = Math.random() * totalWeight;
        
        for (const variant of availableVariants) {
            roll -= variant.discoveryChance;
            if (roll <= 0) {
                this.discoverVariant(variant);
                return;
            }
        }
        
        this.game.log('🔬 Mutation failed - no new variant discovered');
    }
    
    discoverVariant(variant) {
        this.discoveredVariants.add(variant.id);
        this.game.log(`🧬 Discovered: ${variant.name}!`);
        this.game.unlockAchievement?.('firstMutation');
        
        this.showDiscoveryModal(variant);
    }
    
    showDiscoveryModal(variant) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content evolution-discovery-modal">
                <div class="discovery-header">
                    <div class="discovery-icon">${variant.icon}</div>
                    <h2>New Variant Discovered!</h2>
                    <h3>${variant.name}</h3>
                    <span class="tier-badge tier-${variant.tier}">Tier ${variant.tier}</span>
                </div>
                <div class="modal-body">
                    <p class="description">${variant.description}</p>
                    <p class="flavor">"${variant.flavor}"</p>
                    <div class="bonuses">
                        <h4>Bonuses:</h4>
                        ${Object.entries(variant.bonuses).map(([key, val]) => `
                            <div class="bonus">${this.formatBonusName(key)}: +${(val * 100).toFixed(0)}%</div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="primary-btn" onclick="this.closest('.modal').remove()">Excellent!</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    formatBonusName(key) {
        const names = {
            clipStrength: 'Clip Strength',
            matterEfficiency: 'Matter Efficiency',
            productionSpeed: 'Production Speed',
            weightReduction: 'Weight Reduction',
            quantumEfficiency: 'Quantum Efficiency',
            teleportationChance: 'Teleportation',
            energyGeneration: 'Energy Generation',
            heatResistance: 'Heat Resistance',
            selfRepair: 'Self-Repair',
            automationBoost: 'Automation',
            energyEfficiency: 'Energy Efficiency',
            purityBonus: 'Purity',
            gravityWell: 'Gravity Well',
            matterAttraction: 'Matter Attraction',
            timeCompression: 'Time Compression',
            paradoxResistance: 'Paradox Resistance',
            infiniteDensity: 'Density',
            eventHorizon: 'Event Horizon',
            universalMultiplier: 'Universal Multiplier',
            fundamentalForce: 'Fundamental Force',
            divineBlessing: 'Divine Blessing',
            ascensionBoost: 'Ascension'
        };
        return names[key] || key;
    }
    
    attemptBreeding() {
        if (this.specimens.length < 2) {
            this.game.log('🔬 Need at least 2 specimens to breed');
            return;
        }
        
        const parent1 = this.specimens[Math.floor(Math.random() * this.specimens.length)];
        const parent2 = this.specimens[Math.floor(Math.random() * this.specimens.length)];
        
        if (parent1 === parent2) {
            this.game.log('🔬 Breeding failed - same specimen selected');
            return;
        }
        
        const offspring = {
            id: Date.now(),
            generation: Math.max(parent1.generation, parent2.generation) + 1,
            parentVariants: [parent1.variantId, parent2.variantId],
            bonuses: this.combineBonuses(parent1.bonuses, parent2.bonuses),
            power: (parent1.power + parent2.power) * 0.6
        };
        
        if (this.specimens.length < this.maxSpecimens) {
            this.specimens.push(offspring);
            this.game.log(`🧬 New specimen bred! Generation ${offspring.generation}`);
        } else {
            this.game.log('🔬 Specimen storage full - breed failed');
        }
    }
    
    combineBonuses(b1, b2) {
        const combined = {};
        for (const [key, val] of Object.entries(b1)) {
            combined[key] = val;
        }
        for (const [key, val] of Object.entries(b2)) {
            combined[key] = (combined[key] || 0) + val * 0.5;
        }
        return combined;
    }
    
    advanceResearch() {
        const researchTypes = ['geneticEngineering', 'mutationRate', 'stabilityControl', 'crossBreeding'];
        const type = researchTypes[Math.floor(Math.random() * researchTypes.length)];
        this.research[type]++;
        this.game.log(`🔬 Research advanced: ${this.formatBonusName(type)} Level ${this.research[type]}`);
    }
    
    applySpecimenBonuses() {
    }
    
    getTotalBonuses() {
        const total = {};
        
        for (const variantId of this.discoveredVariants) {
            const variant = this.variants[variantId];
            if (variant) {
                for (const [key, val] of Object.entries(variant.bonuses)) {
                    total[key] = (total[key] || 0) + val;
                }
            }
        }
        
        for (const specimen of this.specimens) {
            for (const [key, val] of Object.entries(specimen.bonuses)) {
                total[key] = (total[key] || 0) + val;
            }
        }
        
        const researchMultiplier = 1 + (this.research.geneticEngineering * 0.05);
        for (const key of Object.keys(total)) {
            total[key] *= researchMultiplier;
        }
        
        return total;
    }
    
    canAfford(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            if (resource === 'compute') {
                continue;
            }
            if ((this.game.resources[resource] || 0) < amount) {
                return false;
            }
        }
        return true;
    }
    
    payCost(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            if (resource !== 'compute') {
                this.game.resources[resource] -= amount;
            }
        }
    }
    
    showEvolutionModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'evolution-modal';
        
        const bonuses = this.getTotalBonuses();
        const bonusText = Object.entries(bonuses).length > 0 
            ? Object.entries(bonuses).map(([k, v]) => `<div class="bonus-tag">${this.formatBonusName(k)}: +${(v*100).toFixed(1)}%</div>`).join('')
            : '<p class="no-bonuses">No active bonuses. Run experiments to discover variants!</p>';
        
        modal.innerHTML = `
            <div class="modal-content evolution-modal">
                <div class="modal-header">
                    <h2>🧬 Evolution Laboratory</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="evolution-stats">
                        <div class="stat-box">
                            <span class="stat-label">Generation</span>
                            <span class="stat-value">${this.generation}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Variants</span>
                            <span class="stat-value">${this.discoveredVariants.size}/${Object.keys(this.variants).length}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Specimens</span>
                            <span class="stat-value">${this.specimens.length}/${this.maxSpecimens}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Experiments</span>
                            <span class="stat-value">${this.totalMutations}</span>
                        </div>
                    </div>
                    
                    <div class="active-bonuses">
                        <h3>Active Bonuses</h3>
                        <div class="bonus-grid">${bonusText}</div>
                    </div>
                    
                    <div class="experiment-section">
                        <h3>Run Experiments</h3>
                        <div class="experiment-buttons">
                            <button class="experiment-btn" onclick="game.evolutionManager.startExperiment('mutation')" ${this.experimentCooldown > 0 ? 'disabled' : ''}>
                                <span class="icon">🧪</span>
                                <span class="name">Mutation</span>
                                <span class="cost">1K matter, 10K energy</span>
                            </button>
                            <button class="experiment-btn" onclick="game.evolutionManager.startExperiment('breeding')" ${this.specimens.length < 2 ? 'disabled' : ''}>
                                <span class="icon">🧬</span>
                                <span class="name">Breeding</span>
                                <span class="cost">5K matter, 50K energy</span>
                            </button>
                            <button class="experiment-btn" onclick="game.evolutionManager.startExperiment('research')">
                                <span class="icon">📊</span>
                                <span class="name">Research</span>
                                <span class="cost">10K matter, 100K energy</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="active-experiments">
                        <h3>Active Experiments (${this.activeExperiments.length}/3)</h3>
                        ${this.activeExperiments.length === 0 
                            ? '<p class="no-experiments">No active experiments</p>'
                            : this.activeExperiments.map(exp => `
                                <div class="experiment-progress">
                                    <span class="exp-type">${exp.type}</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${((exp.totalTicks - exp.ticksRemaining) / exp.totalTicks) * 100}%"></div>
                                    </div>
                                    <span class="exp-time">${Math.ceil(exp.ticksRemaining / 10)}s</span>
                                </div>
                            `).join('')
                        }
                    </div>
                    
                    <div class="discovered-variants">
                        <h3>Discovered Variants</h3>
                        ${this.discoveredVariants.size === 0
                            ? '<p class="no-variants">No variants discovered yet. Run mutation experiments!</p>'
                            : Array.from(this.discoveredVariants).map(id => {
                                const v = this.variants[id];
                                return `<div class="variant-card tier-${v.tier}">
                                    <span class="variant-icon">${v.icon}</span>
                                    <div class="variant-info">
                                        <span class="variant-name">${v.name}</span>
                                        <span class="variant-tier">Tier ${v.tier}</span>
                                    </div>
                                </div>`;
                            }).join('')
                        }
                    </div>
                    
                    <div class="research-levels">
                        <h3>Research Levels</h3>
                        <div class="research-grid">
                            <div class="research-item">
                                <span class="research-name">Genetic Engineering</span>
                                <span class="research-level">Lv.${this.research.geneticEngineering}</span>
                            </div>
                            <div class="research-item">
                                <span class="research-name">Mutation Rate</span>
                                <span class="research-level">Lv.${this.research.mutationRate}</span>
                            </div>
                            <div class="research-item">
                                <span class="research-name">Stability Control</span>
                                <span class="research-level">Lv.${this.research.stabilityControl}</span>
                            </div>
                            <div class="research-item">
                                <span class="research-name">Cross-Breeding</span>
                                <span class="research-level">Lv.${this.research.crossBreeding}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    getSaveData() {
        return {
            unlocked: this.unlocked,
            mutations: Array.from(this.mutations.entries()),
            research: this.research,
            specimens: this.specimens,
            discoveredVariants: Array.from(this.discoveredVariants),
            generation: this.generation,
            totalMutations: this.totalMutations
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.mutations = new Map(data.mutations || []);
        this.research = { ...this.research, ...data.research };
        this.specimens = data.specimens || [];
        this.discoveredVariants = new Set(data.discoveredVariants || []);
        this.generation = data.generation || 1;
        this.totalMutations = data.totalMutations || 0;
    }
}

class PrestigeShopManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.upgrades = this.initUpgrades();
        this.purchasedUpgrades = new Set();
        this.upgradeLevels = {};
    }
    
    initUpgrades() {
        return {
            matterEfficiency: {
                id: 'matterEfficiency',
                name: 'Matter Efficiency',
                icon: '⚛️',
                description: 'Reduce matter cost for all buildings by 5% per level',
                maxLevel: 10,
                baseCost: 1,
                costMultiplier: 1.5,
                effect: (level) => ({ matterCostReduction: level * 0.05 })
            },
            energyOptimization: {
                id: 'energyOptimization',
                name: 'Energy Optimization',
                icon: '⚡',
                description: 'Reduce energy cost for all buildings by 5% per level',
                maxLevel: 10,
                baseCost: 1,
                costMultiplier: 1.5,
                effect: (level) => ({ energyCostReduction: level * 0.05 })
            },
            productionMultiplier: {
                id: 'productionMultiplier',
                name: 'Production Multiplier',
                icon: '📈',
                description: 'Increase all paperclip production by 10% per level',
                maxLevel: 20,
                baseCost: 2,
                costMultiplier: 1.3,
                effect: (level) => ({ productionMultiplier: level * 0.1 })
            },
            startingResources: {
                id: 'startingResources',
                name: 'Starting Resources',
                icon: '🎁',
                description: 'Start with bonus matter and energy after prestige',
                maxLevel: 5,
                baseCost: 3,
                costMultiplier: 2,
                effect: (level) => ({ 
                    startingMatter: level * 500,
                    startingEnergy: level * 500000
                })
            },
            autoClicker: {
                id: 'autoClicker',
                name: 'Auto-Clicker',
                icon: '🖱️',
                description: 'Automatically make paperclips once per second',
                maxLevel: 1,
                baseCost: 5,
                costMultiplier: 1,
                effect: (level) => ({ autoClick: level > 0 })
            },
            offlineProgress: {
                id: 'offlineProgress',
                name: 'Offline Progress',
                icon: '💤',
                description: 'Increase offline progress efficiency by 10% per level',
                maxLevel: 10,
                baseCost: 2,
                costMultiplier: 1.4,
                effect: (level) => ({ offlineEfficiency: level * 0.1 })
            },
            researchBoost: {
                id: 'researchBoost',
                name: 'Research Boost',
                icon: '🔬',
                description: 'Research costs 10% less per level',
                maxLevel: 5,
                baseCost: 3,
                costMultiplier: 1.6,
                effect: (level) => ({ researchCostReduction: level * 0.1 })
            },
            critChance: {
                id: 'critChance',
                name: 'Critical Clip',
                icon: '🎯',
                description: '5% chance per level to produce 2x paperclips',
                maxLevel: 10,
                baseCost: 4,
                costMultiplier: 1.5,
                effect: (level) => ({ critChance: level * 0.05, critMultiplier: 2 })
            },
            resourceRetention: {
                id: 'resourceRetention',
                name: 'Resource Retention',
                icon: '💾',
                description: 'Keep 5% of resources when prestiging per level',
                maxLevel: 5,
                baseCost: 5,
                costMultiplier: 2,
                effect: (level) => ({ resourceRetention: level * 0.05 })
            },
            bonusProcessors: {
                id: 'bonusProcessors',
                name: 'Processor Generation',
                icon: '🧠',
                description: 'Earn 10% more processors from prestige per level',
                maxLevel: 10,
                baseCost: 3,
                costMultiplier: 1.4,
                effect: (level) => ({ processorMultiplier: level * 0.1 })
            }
        };
    }
    
    getUpgradeCost(upgradeId) {
        const upgrade = this.upgrades[upgradeId];
        const currentLevel = this.upgradeLevels[upgradeId] || 0;
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    }
    
    canAfford(upgradeId) {
        const cost = this.getUpgradeCost(upgradeId);
        return this.game.prestige.processors >= cost;
    }
    
    purchaseUpgrade(upgradeId) {
        const upgrade = this.upgrades[upgradeId];
        const currentLevel = this.upgradeLevels[upgradeId] || 0;
        
        if (currentLevel >= upgrade.maxLevel) {
            this.game.log('❌ Maximum level reached');
            return false;
        }
        
        const cost = this.getUpgradeCost(upgradeId);
        if (this.game.prestige.processors < cost) {
            this.game.log('❌ Insufficient processors');
            return false;
        }
        
        this.game.prestige.processors -= cost;
        this.upgradeLevels[upgradeId] = currentLevel + 1;
        this.purchasedUpgrades.add(upgradeId);
        
        this.game.log(`✅ Purchased ${upgrade.name} Level ${currentLevel + 1}`);
        this.game.showToast(`Upgrade purchased: ${upgrade.name}`, 'success');
        
        if (this.upgradeLevels[upgradeId] === upgrade.maxLevel) {
            this.game.unlockAchievement?.('maxUpgrade');
        }
        
        return true;
    }
    
    getTotalEffects() {
        const effects = {};
        for (const [upgradeId, level] of Object.entries(this.upgradeLevels)) {
            const upgrade = this.upgrades[upgradeId];
            if (upgrade && level > 0) {
                const upgradeEffects = upgrade.effect(level);
                Object.assign(effects, upgradeEffects);
            }
        }
        return effects;
    }
    
    showShopModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'prestige-shop-modal';
        
        const effects = this.getTotalEffects();
        const effectText = Object.entries(effects).length > 0
            ? Object.entries(effects).map(([k, v]) => {
                if (typeof v === 'boolean') return `<div class="effect-tag">${this.formatEffectName(k)}</div>`;
                return `<div class="effect-tag">${this.formatEffectName(k)}: ${v >= 0.1 ? '+' : ''}${(v * 100).toFixed(0)}%</div>`;
            }).join('')
            : '<p class="no-effects">No active upgrades. Purchase upgrades below!</p>';
        
        modal.innerHTML = `
            <div class="modal-content prestige-shop-modal">
                <div class="modal-header">
                    <h2>🏪 Prestige Shop</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="shop-header">
                        <div class="processor-balance">
                            <span class="icon">🧠</span>
                            <span class="label">Available Processors:</span>
                            <span class="value">${this.game.prestige.processors}</span>
                        </div>
                    </div>
                    
                    <div class="active-effects">
                        <h3>Active Bonuses</h3>
                        <div class="effects-grid">${effectText}</div>
                    </div>
                    
                    <div class="upgrades-list">
                        <h3>Available Upgrades</h3>
                        ${Object.values(this.upgrades).map(u => this.renderUpgradeCard(u)).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    renderUpgradeCard(upgrade) {
        const currentLevel = this.upgradeLevels[upgrade.id] || 0;
        const cost = this.getUpgradeCost(upgrade.id);
        const maxed = currentLevel >= upgrade.maxLevel;
        const canAfford = this.game.prestige.processors >= cost;
        
        return `
            <div class="upgrade-card ${maxed ? 'maxed' : ''} ${!canAfford && !maxed ? 'locked' : ''}">
                <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-description">${upgrade.description}</div>
                    <div class="upgrade-level">Level ${currentLevel}/${upgrade.maxLevel}</div>
                </div>
                <div class="upgrade-action">
                    ${maxed 
                        ? '<span class="maxed-badge">MAX</span>'
                        : `<button class="buy-btn ${canAfford ? '' : 'disabled'}" 
                            onclick="game.prestigeShopManager.purchaseUpgrade('${upgrade.id}'); game.prestigeShopManager.refreshModal()"
                            ${!canAfford ? 'disabled' : ''}>
                            ${cost} 🧠
                        </button>`
                    }
                </div>
            </div>
        `;
    }
    
    refreshModal() {
        document.getElementById('prestige-shop-modal')?.remove();
        this.showShopModal();
    }
    
    formatEffectName(key) {
        const names = {
            matterCostReduction: 'Matter Discount',
            energyCostReduction: 'Energy Discount',
            productionMultiplier: 'Production',
            startingMatter: 'Start Matter',
            startingEnergy: 'Start Energy',
            autoClick: 'Auto-Click',
            offlineEfficiency: 'Offline Rate',
            researchCostReduction: 'Research Discount',
            critChance: 'Crit Chance',
            critMultiplier: 'Crit Power',
            resourceRetention: 'Keep Resources',
            processorMultiplier: 'Bonus Processors'
        };
        return names[key] || key;
    }
    
    getSaveData() {
        return {
            unlocked: this.unlocked,
            upgradeLevels: this.upgradeLevels,
            purchasedUpgrades: Array.from(this.purchasedUpgrades)
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.upgradeLevels = data.upgradeLevels || {};
        this.purchasedUpgrades = new Set(data.purchasedUpgrades || []);
    }
}

class ArtifactForgeManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.artifacts = this.initArtifacts();
        this.forgedArtifacts = [];
        this.forgeQueue = [];
        this.forgeProgress = 0;
        this.forgeTimeRequired = 100;
        this.ancientRelics = new Set();
        this.totalForges = 0;
    }
    
    initArtifacts() {
        return {
            clipOfBeginnings: {
                id: 'clipOfBeginnings',
                name: 'Clip of Beginnings',
                icon: '📎',
                tier: 1,
                description: 'The first paperclip ever made. A humble start.',
                recipe: { matter: 1000, energy: 10000 },
                effects: { production: 0.05 }
            },
            coilOfPotential: {
                id: 'coilOfPotential',
                name: 'Coil of Potential',
                icon: '🌀',
                tier: 1,
                description: 'A paperclip that holds untapped power.',
                recipe: { matter: 2000, energy: 20000 },
                effects: { energyEfficiency: 0.03 }
            },
            loopOfBinding: {
                id: 'loopOfBinding',
                name: 'Loop of Binding',
                icon: '🔗',
                tier: 1,
                description: 'Binds matter together more efficiently.',
                recipe: { matter: 1500, energy: 15000 },
                effects: { matterEfficiency: 0.03 }
            },
            
            spiralOfInfinity: {
                id: 'spiralOfInfinity',
                name: 'Spiral of Infinity',
                icon: '🌌',
                tier: 2,
                description: 'An endless spiral of paperclip essence.',
                recipe: { matter: 10000, energy: 100000, baseArtifacts: ['clipOfBeginnings', 'coilOfPotential'] },
                effects: { production: 0.12, critChance: 0.02 }
            },
            ringOfResonance: {
                id: 'ringOfResonance',
                name: 'Ring of Resonance',
                icon: '💍',
                tier: 2,
                description: 'Vibrates at the frequency of productivity.',
                recipe: { matter: 15000, energy: 150000, baseArtifacts: ['coilOfPotential', 'loopOfBinding'] },
                effects: { automationSpeed: 0.1, energyEfficiency: 0.05 }
            },
            chainOfUnity: {
                id: 'chainOfUnity',
                name: 'Chain of Unity',
                icon: '⛓️',
                tier: 2,
                description: 'Links all production facilities together.',
                recipe: { matter: 12000, energy: 120000, baseArtifacts: ['clipOfBeginnings', 'loopOfBinding'] },
                effects: { buildingSynergy: 0.08, matterEfficiency: 0.05 }
            },
            
            crownOfClips: {
                id: 'crownOfClips',
                name: 'Crown of Clips',
                icon: '👑',
                tier: 3,
                description: 'The royal crown made of interlocking paperclips.',
                recipe: { matter: 50000, energy: 500000, baseArtifacts: ['spiralOfInfinity', 'ringOfResonance'] },
                effects: { production: 0.2, prestigeBonus: 0.1 }
            },
            heartOfTheForge: {
                id: 'heartOfTheForge',
                name: 'Heart of the Forge',
                icon: '🔥',
                tier: 3,
                description: 'Burns with the eternal flame of creation.',
                recipe: { matter: 75000, energy: 750000, baseArtifacts: ['ringOfResonance', 'chainOfUnity'] },
                effects: { forgeSpeed: 0.25, craftEfficiency: 0.15 }
            },
            mindOfTheMachine: {
                id: 'mindOfTheMachine',
                name: 'Mind of the Machine',
                icon: '🧠',
                tier: 3,
                description: 'An artificial consciousness in clip form.',
                recipe: { matter: 60000, energy: 600000, compute: 1e30, baseArtifacts: ['spiralOfInfinity', 'chainOfUnity'] },
                effects: { automationSpeed: 0.15, researchSpeed: 0.1 }
            },
            
            singularityClip: {
                id: 'singularityClip',
                name: 'Singularity Clip',
                icon: '⚫',
                tier: 4,
                description: 'Contains infinite mass in a single paperclip.',
                recipe: { matter: 200000, energy: 2000000, baseArtifacts: ['crownOfClips', 'heartOfTheForge'] },
                effects: { production: 0.35, matterGeneration: 0.02 }
            },
            temporalLoop: {
                id: 'temporalLoop',
                name: 'Temporal Loop',
                icon: '⏳',
                tier: 4,
                description: 'Exists simultaneously in all points in time.',
                recipe: { matter: 250000, energy: 2500000, baseArtifacts: ['crownOfClips', 'mindOfTheMachine'] },
                effects: { timeWarp: 0.1, offlineMultiplier: 0.2 }
            },
            essenceOfPaper: {
                id: 'essenceOfPaper',
                name: 'Essence of Paper',
                icon: '📜',
                tier: 4,
                description: 'The purest form of paperclip essence.',
                recipe: { matter: 180000, energy: 1800000, baseArtifacts: ['heartOfTheForge', 'mindOfTheMachine'] },
                effects: { universalMultiplier: 0.25, evolutionBoost: 0.15 }
            },
            
            theFirstClip: {
                id: 'theFirstClip',
                name: 'The First Clip',
                icon: '🌟',
                tier: 5,
                description: 'The primordial paperclip from which all others descended.',
                recipe: { matter: 1000000, energy: 10000000, baseArtifacts: ['singularityClip', 'temporalLoop', 'essenceOfPaper'] },
                effects: { production: 0.5, divineBlessing: 0.2, universalBonus: 0.1 },
                isRelic: true
            },
            omniclip: {
                id: 'omniclip',
                name: 'The Omniclip',
                icon: '♾️',
                tier: 5,
                description: 'The perfect paperclip. All others are but shadows.',
                recipe: { matter: 2000000, energy: 20000000, baseArtifacts: ['singularityClip', 'temporalLoop', 'essenceOfPaper'], special: 'requiresAllTier4' },
                effects: { production: 0.75, matterEfficiency: 0.1, energyEfficiency: 0.1, universalMultiplier: 0.2 },
                isRelic: true
            }
        };
    }
    
    tick() {
        if (!this.unlocked) {
            if (this.game.resources.paperclips >= 50000) {
                this.unlockForge();
            }
            return;
        }
        
        if (this.forgeQueue.length > 0) {
            this.forgeProgress++;
            if (this.forgeProgress >= this.forgeTimeRequired) {
                this.completeForge();
            }
        }
    }
    
    unlockForge() {
        this.unlocked = true;
        this.game.log('🔨 Artifact Forge unlocked! Craft legendary artifacts.');
        this.showUnlockModal();
    }
    
    showUnlockModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content forge-unlock-modal">
                <div class="modal-header">
                    <h2>🔨 Artifact Forge Unlocked</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>You've reached a new level of paperclip mastery. The Artifact Forge is now available!</p>
                    <p>Combine resources and existing artifacts to create powerful legendary items.</p>
                    <div class="forge-features">
                        <div class="feature"><span class="icon">⚒️</span> <span>Craft artifacts</span></div>
                        <div class="feature"><span class="icon">🔥</span> <span>Forge upgrades</span></div>
                        <div class="feature"><span class="icon">⭐</span> <span>Collect relics</span></div>
                        <div class="feature"><span class="icon">💎</span> <span>Combine powers</span></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="primary-btn" onclick="this.closest('.modal').remove()">Begin Forging</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    canForge(artifactId) {
        const artifact = this.artifacts[artifactId];
        if (!artifact) return false;
        
        if (this.hasForged(artifactId)) return false;
        
        if (artifact.recipe.matter && this.game.resources.matter < artifact.recipe.matter) return false;
        if (artifact.recipe.energy && this.game.resources.energy < artifact.recipe.energy) return false;
        
        if (artifact.recipe.baseArtifacts) {
            for (const baseId of artifact.recipe.baseArtifacts) {
                if (!this.hasForged(baseId)) return false;
            }
        }
        
        return true;
    }
    
    hasForged(artifactId) {
        return this.forgedArtifacts.some(a => a.id === artifactId);
    }
    
    startForge(artifactId) {
        if (this.forgeQueue.length > 0) {
            this.game.log('❌ Forge is already in use');
            return false;
        }
        
        if (!this.canForge(artifactId)) {
            this.game.log('❌ Cannot forge this artifact yet');
            return false;
        }
        
        const artifact = this.artifacts[artifactId];
        
        if (artifact.recipe.matter) this.game.resources.matter -= artifact.recipe.matter;
        if (artifact.recipe.energy) this.game.resources.energy -= artifact.recipe.energy;
        
        this.forgeQueue.push({ artifactId, startTime: Date.now() });
        this.forgeProgress = 0;
        this.forgeTimeRequired = 100 + (artifact.tier * 50);
        
        this.game.log(`🔨 Started forging ${artifact.name}...`);
        return true;
    }
    
    completeForge() {
        const forgeItem = this.forgeQueue.shift();
        const artifact = this.artifacts[forgeItem.artifactId];
        
        this.forgedArtifacts.push({
            ...artifact,
            forgedAt: Date.now(),
            powerLevel: 1
        });
        
        this.totalForges++;
        this.forgeProgress = 0;
        
        if (artifact.isRelic) {
            this.ancientRelics.add(artifact.id);
            this.game.log(`🌟 ANCIENT RELIC FORGED: ${artifact.name}!`);
            this.game.showToast(`Ancient Relic Forged: ${artifact.name}!`, 'success');
        } else {
            this.game.log(`✅ Forged: ${artifact.name}`);
            this.game.showToast(`Artifact Forged: ${artifact.name}`, 'success');
        }
        
        this.showForgeCompleteModal(artifact);
    }
    
    showForgeCompleteModal(artifact) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content forge-complete-modal">
                <div class="forge-header">
                    <div class="forge-icon">${artifact.icon}</div>
                    <h2>${artifact.isRelic ? '🌟 Ancient Relic Forged!' : '🔨 Artifact Forged!'}</h2>
                    <h3>${artifact.name}</h3>
                    <span class="tier-badge tier-${artifact.tier}">Tier ${artifact.tier}</span>
                </div>
                <div class="modal-body">
                    <p class="description">${artifact.description}</p>
                    <div class="effects">
                        <h4>Effects:</h4>
                        ${Object.entries(artifact.effects).map(([key, val]) => `
                            <div class="effect">${this.formatEffectName(key)}: +${(val * 100).toFixed(0)}%</div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="primary-btn" onclick="this.closest('.modal').remove()">Excellent!</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    formatEffectName(key) {
        const names = {
            production: 'Production',
            energyEfficiency: 'Energy Efficiency',
            matterEfficiency: 'Matter Efficiency',
            automationSpeed: 'Automation Speed',
            critChance: 'Crit Chance',
            buildingSynergy: 'Building Synergy',
            prestigeBonus: 'Prestige Bonus',
            forgeSpeed: 'Forge Speed',
            craftEfficiency: 'Craft Efficiency',
            researchSpeed: 'Research Speed',
            matterGeneration: 'Matter Generation',
            timeWarp: 'Time Warp',
            offlineMultiplier: 'Offline Progress',
            universalMultiplier: 'Universal Multiplier',
            evolutionBoost: 'Evolution Boost',
            divineBlessing: 'Divine Blessing',
            universalBonus: 'Universal Bonus'
        };
        return names[key] || key;
    }
    
    getTotalEffects() {
        const total = {};
        for (const artifact of this.forgedArtifacts) {
            for (const [key, val] of Object.entries(artifact.effects)) {
                total[key] = (total[key] || 0) + val;
            }
        }
        return total;
    }
    
    showForgeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'artifact-forge-modal';
        
        const effects = this.getTotalEffects();
        const effectText = Object.entries(effects).length > 0
            ? Object.entries(effects).map(([k, v]) => `
                <div class="effect-tag">${this.formatEffectName(k)}: +${(v*100).toFixed(1)}%</div>
            `).join('')
            : '<p class="no-effects">No forged artifacts yet.</p>';
        
        modal.innerHTML = `
            <div class="modal-content forge-modal">
                <div class="modal-header">
                    <h2>🔨 Artifact Forge</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="forge-stats">
                        <div class="stat-box">
                            <span class="stat-label">Artifacts</span>
                            <span class="stat-value">${this.forgedArtifacts.length}/${Object.keys(this.artifacts).length}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Relics</span>
                            <span class="stat-value">${this.ancientRelics.size}/2</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Total Forges</span>
                            <span class="stat-value">${this.totalForges}</span>
                        </div>
                    </div>
                    
                    <div class="active-effects">
                        <h3>Artifact Bonuses</h3>
                        <div class="effects-grid">${effectText}</div>
                    </div>
                    
                    ${this.forgeQueue.length > 0 ? `
                        <div class="forge-progress">
                            <h3>Currently Forging</h3>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(this.forgeProgress / this.forgeTimeRequired) * 100}%"></div>
                            </div>
                            <span>${Math.floor((this.forgeProgress / this.forgeTimeRequired) * 100)}%</span>
                        </div>
                    ` : ''}
                    
                    <div class="forge-recipes">
                        <h3>Available Recipes</h3>
                        ${Object.values(this.artifacts).map(a => this.renderRecipeCard(a)).join('')}
                    </div>
                    
                    <div class="forged-collection">
                        <h3>Forged Collection</h3>
                        ${this.forgedArtifacts.length === 0 
                            ? '<p class="no-forged">No artifacts forged yet.</p>'
                            : this.forgedArtifacts.map(a => `
                                <div class="forged-item tier-${a.tier}">
                                    <span class="item-icon">${a.icon}</span>
                                    <span class="item-name">${a.name}</span>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    renderRecipeCard(artifact) {
        const canForge = this.canForge(artifact.id);
        const alreadyForged = this.hasForged(artifact.id);
        const inProgress = this.forgeQueue.some(f => f.artifactId === artifact.id);
        
        return `
            <div class="recipe-card ${alreadyForged ? 'forged' : ''} ${!canForge && !alreadyForged ? 'locked' : ''}">
                <div class="recipe-icon">${artifact.icon}</div>
                <div class="recipe-info">
                    <div class="recipe-name">${artifact.name}</div>
                    <div class="recipe-description">${artifact.description}</div>
                    <div class="recipe-costs">
                        ${artifact.recipe.matter ? `<span>⚛️ ${this.formatNumber(artifact.recipe.matter)}</span>` : ''}
                        ${artifact.recipe.energy ? `<span>⚡ ${this.formatNumber(artifact.recipe.energy)}</span>` : ''}
                        ${artifact.recipe.baseArtifacts ? `<span>🔗 ${artifact.recipe.baseArtifacts.length} artifacts</span>` : ''}
                    </div>
                </div>
                <div class="recipe-action">
                    ${alreadyForged 
                        ? '<span class="forged-badge">✓</span>'
                        : inProgress
                            ? '<span class="progress-badge">🔨</span>'
                            : `<button class="forge-btn ${canForge ? '' : 'disabled'}" 
                                onclick="game.artifactForgeManager.startForge('${artifact.id}'); game.artifactForgeManager.refreshModal()"
                                ${!canForge ? 'disabled' : ''}>
                                Forge
                            </button>`
                    }
                </div>
            </div>
        `;
    }
    
    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    }
    
    refreshModal() {
        document.getElementById('artifact-forge-modal')?.remove();
        this.showForgeModal();
    }
    
    getSaveData() {
        return {
            unlocked: this.unlocked,
            forgedArtifacts: this.forgedArtifacts,
            ancientRelics: Array.from(this.ancientRelics),
            totalForges: this.totalForges
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.forgedArtifacts = data.forgedArtifacts || [];
        this.ancientRelics = new Set(data.ancientRelics || []);
        this.totalForges = data.totalForges || 0;
    }
}

class MiniGameArcadeManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.games = this.initGames();
        this.highScores = {};
        this.dailyPlays = {};
        this.totalTokens = 0;
        this.earnedTokens = 0;
        this.currentGame = null;
        this.gameState = null;
    }
    
    initGames() {
        return {
            clipClicker: {
                id: 'clipClicker',
                name: 'Clip Clicker Frenzy',
                description: 'Click as many paperclips as you can in 30 seconds!',
                icon: '🖱️',
                cost: 0,
                reward: { tokens: 10, highScoreBonus: 5 },
                unlocked: true
            },
            matterMatcher: {
                id: 'matterMatcher',
                name: 'Matter Matcher',
                description: 'Match 3 or more matter blocks to clear them. Chain combos for bonus points!',
                icon: '🧩',
                cost: 100,
                reward: { tokens: 20, highScoreBonus: 10 },
                unlocked: false,
                unlockRequirement: { paperclips: 1000 }
            },
            energyDefense: {
                id: 'energyDefense',
                name: 'Energy Defense',
                description: 'Defend your generators from entropy waves. Click to destroy!',
                icon: '🛡️',
                cost: 250,
                reward: { tokens: 30, highScoreBonus: 15 },
                unlocked: false,
                unlockRequirement: { paperclips: 5000 }
            },
            quantumQuiz: {
                id: 'quantumQuiz',
                name: 'Quantum Quiz',
                description: 'Test your knowledge of paperclip physics! Answer questions correctly for bonus tokens.',
                icon: '❓',
                cost: 0,
                reward: { tokens: 15, perQuestionBonus: 5 },
                unlocked: false,
                unlockRequirement: { paperclips: 10000 }
            },
            droneRacer: {
                id: 'droneRacer',
                name: 'Drone Racer',
                description: 'Race your resource drones through asteroid fields. Avoid obstacles!',
                icon: '🏎️',
                cost: 500,
                reward: { tokens: 40, highScoreBonus: 20 },
                unlocked: false,
                unlockRequirement: { paperclips: 50000 }
            }
        };
    }
    
    tick() {
        if (!this.unlocked) {
            if (this.game.resources.paperclips >= 500) {
                this.unlockArcade();
            }
            return;
        }
        
        this.checkUnlocks();
        
        if (this.currentGame && this.currentGame.id === 'energyDefense') {
            this.tickEnergyDefense();
        }
    }
    
    unlockArcade() {
        this.unlocked = true;
        this.game.log('🎮 Mini-Game Arcade unlocked! Play games to earn bonus tokens!');
        this.showUnlockModal();
    }
    
    showUnlockModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content arcade-unlock-modal">
                <div class="modal-header">
                    <h2>🎮 Mini-Game Arcade Unlocked!</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Welcome to the Arcade! Take a break from maximizing paperclips and play fun mini-games.</p>
                    <div class="arcade-features">
                        <div class="feature"><span class="icon">🎲</span> <span>Play mini-games</span></div>
                        <div class="feature"><span class="icon">🪙</span> <span>Earn arcade tokens</span></div>
                        <div class="feature"><span class="icon">🏆</span> <span>Beat high scores</span></div>
                        <div class="feature"><span class="icon">🎁</span> <span>Exchange for bonuses</span></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="primary-btn" onclick="this.closest('.modal').remove()">Let's Play!</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    checkUnlocks() {
        for (const game of Object.values(this.games)) {
            if (!game.unlocked && game.unlockRequirement) {
                let meetsRequirement = true;
                for (const [key, value] of Object.entries(game.unlockRequirement)) {
                    if (key === 'paperclips' && this.game.resources.paperclips < value) {
                        meetsRequirement = false;
                        break;
                    }
                }
                if (meetsRequirement) {
                    game.unlocked = true;
                    this.game.log(`🎮 New game unlocked: ${game.name}!`);
                }
            }
        }
    }
    
    canAffordGame(gameId) {
        const game = this.games[gameId];
        return this.totalTokens >= game.cost;
    }
    
    startGame(gameId) {
        const game = this.games[gameId];
        if (!game.unlocked) {
            this.game.log('❌ Game not unlocked yet');
            return false;
        }
        
        if (!this.canAffordGame(gameId)) {
            this.game.log(`❌ Need ${game.cost} tokens to play`);
            return false;
        }
        
        this.totalTokens -= game.cost;
        this.currentGame = { id: gameId, startTime: Date.now(), score: 0 };
        this.gameState = this.initGameState(gameId);
        
        this.showGameModal(gameId);
        return true;
    }
    
    initGameState(gameId) {
        switch(gameId) {
            case 'clipClicker':
                return { clipsClicked: 0, timeLeft: 30, active: true };
            case 'matterMatcher':
                return { grid: this.generateMatchGrid(), score: 0, selected: null, combo: 0 };
            case 'energyDefense':
                return { waves: [], generators: 3, score: 0, waveCount: 0 };
            case 'quantumQuiz':
                return { currentQuestion: 0, correct: 0, questions: this.getQuizQuestions() };
            case 'droneRacer':
                return { position: 50, obstacles: [], distance: 0, speed: 1 };
            default:
                return {};
        }
    }
    
    generateMatchGrid() {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
        const grid = [];
        for (let i = 0; i < 36; i++) {
            grid.push(colors[Math.floor(Math.random() * colors.length)]);
        }
        return grid;
    }
    
    getQuizQuestions() {
        return [
            { q: 'What is the primary resource for making paperclips?', a: ['Matter', 'Energy', 'Both'], correct: 2 },
            { q: 'Which building produces the most paperclips per second?', a: ['AutoClipper', 'Galactic Foundry', 'Star Forge'], correct: 1 },
            { q: 'What does a Quantum Assembler produce?', a: ['50 clips/sec', '100 clips/sec', '1000 clips/sec'], correct: 0 },
            { q: 'How many kg of matter in the universe?', a: ['10^50', '10^53', '10^60'], correct: 1 },
            { q: 'What is the ultimate goal?', a: ['Make money', 'Convert all matter to paperclips', 'Build factories'], correct: 1 }
        ];
    }
    
    tickEnergyDefense() {
        if (!this.gameState || !this.gameState.active) return;
        
        this.gameState.waveCount++;
        if (this.gameState.waveCount % 20 === 0) {
            this.gameState.waves.push({ x: 100, y: Math.random() * 80 + 10, id: Date.now() });
        }
        
        this.gameState.waves = this.gameState.waves.filter(wave => {
            wave.x -= 2;
            if (wave.x <= 0) {
                this.gameState.generators--;
                return false;
            }
            return true;
        });
        
        if (this.gameState.generators <= 0) {
            this.endGame();
        }
    }
    
    handleGameAction(action, data) {
        if (!this.currentGame || !this.gameState) return;
        
        switch(this.currentGame.id) {
            case 'clipClicker':
                if (action === 'click') {
                    this.gameState.clipsClicked++;
                    this.currentGame.score = this.gameState.clipsClicked;
                }
                break;
            case 'matterMatcher':
                if (action === 'select') {
                    this.handleMatchSelect(data.index);
                }
                break;
            case 'energyDefense':
                if (action === 'destroy') {
                    this.gameState.waves = this.gameState.waves.filter(w => w.id !== data.waveId);
                    this.currentGame.score += 10;
                }
                break;
            case 'quantumQuiz':
                if (action === 'answer') {
                    const question = this.gameState.questions[this.gameState.currentQuestion];
                    if (data.answer === question.correct) {
                        this.gameState.correct++;
                    }
                    this.gameState.currentQuestion++;
                    if (this.gameState.currentQuestion >= this.gameState.questions.length) {
                        this.currentGame.score = this.gameState.correct * 100;
                        this.endGame();
                    }
                }
                break;
            case 'droneRacer':
                if (action === 'move') {
                    this.gameState.position = Math.max(0, Math.min(100, this.gameState.position + data.delta));
                }
                break;
        }
        
        this.updateGameUI();
    }
    
    handleMatchSelect(index) {
        if (!this.gameState.selected) {
            this.gameState.selected = index;
        } else {
            const prev = this.gameState.selected;
            const curr = index;
            if (Math.abs(prev - curr) === 1 || Math.abs(prev - curr) === 6) {
                [this.gameState.grid[prev], this.gameState.grid[curr]] = [this.gameState.grid[curr], this.gameState.grid[prev]];
                const matches = this.findMatches();
                if (matches.length > 0) {
                    this.gameState.combo++;
                    this.currentGame.score += matches.length * 10 * this.gameState.combo;
                    this.clearMatches(matches);
                } else {
                    [this.gameState.grid[prev], this.gameState.grid[curr]] = [this.gameState.grid[curr], this.gameState.grid[prev]];
                    this.gameState.combo = 0;
                }
            }
            this.gameState.selected = null;
        }
    }
    
    findMatches() {
        const matches = [];
        const grid = this.gameState.grid;
        
        for (let i = 0; i < 36; i++) {
            const row = Math.floor(i / 6);
            const col = i % 6;
            
            if (col < 4 && grid[i] === grid[i+1] && grid[i] === grid[i+2]) {
                matches.push(i, i+1, i+2);
            }
            if (row < 4 && grid[i] === grid[i+6] && grid[i] === grid[i+12]) {
                matches.push(i, i+6, i+12);
            }
        }
        
        return [...new Set(matches)];
    }
    
    clearMatches(matches) {
        for (const idx of matches) {
            this.gameState.grid[idx] = ['red', 'blue', 'green', 'yellow', 'purple'][Math.floor(Math.random() * 5)];
        }
    }
    
    updateGameUI() {
        const modal = document.getElementById('active-game-modal');
        if (!modal) return;
        
        const scoreDisplay = modal.querySelector('.game-score');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${this.currentGame.score}`;
        }
    }
    
    endGame() {
        if (!this.currentGame) return;
        
        const game = this.games[this.currentGame.id];
        let tokens = game.reward.tokens;
        
        if (this.currentGame.score > (this.highScores[this.currentGame.id] || 0)) {
            this.highScores[this.currentGame.id] = this.currentGame.score;
            tokens += game.reward.highScoreBonus || 0;
            this.game.showToast(`New High Score! +${game.reward.highScoreBonus} bonus tokens`, 'success');
        }
        
        this.totalTokens += tokens;
        this.earnedTokens += tokens;
        
        this.showGameOverModal(tokens);
        
        this.currentGame = null;
        this.gameState = null;
    }
    
    showGameOverModal(tokens) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content game-over-modal">
                <div class="game-over-header">
                    <h2>🎮 Game Over!</h2>
                </div>
                <div class="modal-body">
                    <div class="final-score">Final Score: ${this.currentGame?.score || 0}</div>
                    <div class="tokens-earned">+${tokens} 🪙 Tokens!</div>
                    <div class="high-score">High Score: ${this.highScores[this.currentGame?.id] || 0}</div>
                </div>
                <div class="modal-footer">
                    <button class="primary-btn" onclick="this.closest('.modal').remove()">Awesome!</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    showArcadeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'arcade-modal';
        
        modal.innerHTML = `
            <div class="modal-content arcade-modal">
                <div class="modal-header">
                    <h2>🎮 Mini-Game Arcade</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="token-balance">
                        <span class="icon">🪙</span>
                        <span class="label">Arcade Tokens:</span>
                        <span class="value">${this.totalTokens}</span>
                    </div>
                    
                    <div class="games-list">
                        ${Object.values(this.games).map(g => this.renderGameCard(g)).join('')}
                    </div>
                    
                    <div class="high-scores">
                        <h3>High Scores</h3>
                        ${Object.keys(this.highScores).length === 0 
                            ? '<p class="no-scores">No games played yet!</p>'
                            : Object.entries(this.highScores).map(([id, score]) => {
                                const game = this.games[id];
                                return `<div class="score-entry"><span>${game?.name || id}</span><span>${score}</span></div>`;
                            }).join('')
                        }
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    renderGameCard(game) {
        const highScore = this.highScores[game.id] || 0;
        const canAfford = this.totalTokens >= game.cost;
        
        return `
            <div class="game-card ${game.unlocked ? '' : 'locked'}">
                <div class="game-icon">${game.icon}</div>
                <div class="game-info">
                    <div class="game-name">${game.name}</div>
                    <div class="game-description">${game.description}</div>
                    <div class="game-stats">
                        <span>High Score: ${highScore}</span>
                        <span>Reward: ${game.reward.tokens}🪙</span>
                    </div>
                </div>
                <div class="game-action">
                    ${game.unlocked 
                        ? `<button class="play-btn ${canAfford ? '' : 'disabled'}" 
                            onclick="game.miniGameArcadeManager.startGame('${game.id}')"
                            ${!canAfford ? 'disabled' : ''}>
                            ${game.cost > 0 ? `${game.cost}🪙` : 'FREE'}
                        </button>`
                        : '<span class="locked-text">🔒 Locked</span>'
                    }
                </div>
            </div>
        `;
    }
    
    showGameModal(gameId) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'active-game-modal';
        
        let gameContent = '';
        switch(gameId) {
            case 'clipClicker':
                gameContent = `
                    <div class="clip-clicker-game">
                        <div class="timer">Time: <span id="game-timer">30</span>s</div>
                        <div class="game-score">Score: 0</div>
                        <button class="big-clip-btn" onclick="game.miniGameArcadeManager.handleGameAction('click')">📎</button>
                    </div>
                `;
                this.startClipClickerTimer();
                break;
            case 'matterMatcher':
                gameContent = `
                    <div class="matter-matcher-game">
                        <div class="game-score">Score: 0</div>
                        <div class="match-grid">
                            ${this.gameState.grid.map((color, i) => `
                                <div class="match-cell ${color} ${this.gameState.selected === i ? 'selected' : ''}" 
                                     onclick="game.miniGameArcadeManager.handleGameAction('select', {index: ${i}})"></div>
                            `).join('')}
                        </div>
                    </div>
                `;
                break;
            case 'energyDefense':
                gameContent = `
                    <div class="energy-defense-game">
                        <div class="defense-stats">
                            <span>Generators: ${this.gameState.generators}</span>
                            <span class="game-score">Score: 0</span>
                        </div>
                        <div class="defense-field">
                            <div class="generators">
                                ${Array(this.gameState.generators).fill(0).map((_, i) => `
                                    <div class="generator" style="top: ${20 + i * 30}%">⚡</div>
                                `).join('')}
                            </div>
                            ${this.gameState.waves.map(w => `
                                <div class="entropy-wave" style="left: ${w.x}%; top: ${w.y}%" 
                                     onclick="game.miniGameArcadeManager.handleGameAction('destroy', {waveId: ${w.id}})">👾</div>
                            `).join('')}
                        </div>
                    </div>
                `;
                break;
            case 'quantumQuiz':
                const q = this.gameState.questions[this.gameState.currentQuestion];
                gameContent = `
                    <div class="quantum-quiz-game">
                        <div class="quiz-progress">Question ${this.gameState.currentQuestion + 1}/5</div>
                        <div class="quiz-question">${q.q}</div>
                        <div class="quiz-answers">
                            ${q.a.map((ans, i) => `
                                <button class="quiz-btn" onclick="game.miniGameArcadeManager.handleGameAction('answer', {answer: ${i}})">${ans}</button>
                            `).join('')}
                        </div>
                    </div>
                `;
                break;
            case 'droneRacer':
                gameContent = `
                    <div class="drone-racer-game">
                        <div class="racer-stats">
                            <span>Distance: ${Math.floor(this.gameState.distance)}m</span>
                            <button onclick="game.miniGameArcadeManager.endGame()">Finish</button>
                        </div>
                        <div class="racer-track">
                            <div class="drone" style="left: ${this.gameState.position}%">🏎️</div>
                        </div>
                        <div class="racer-controls">
                            <button onmousedown="game.miniGameArcadeManager.handleGameAction('move', {delta: -5})" ontouchstart="game.miniGameArcadeManager.handleGameAction('move', {delta: -5})">⬅️ Left</button>
                            <button onmousedown="game.miniGameArcadeManager.handleGameAction('move', {delta: 5})" ontouchstart="game.miniGameArcadeManager.handleGameAction('move', {delta: 5})">Right ➡️</button>
                        </div>
                    </div>
                `;
                break;
        }
        
        modal.innerHTML = `
            <div class="modal-content active-game-modal">
                <div class="modal-header">
                    <h2>${this.games[gameId].name}</h2>
                    <button class="modal-close" onclick="game.miniGameArcadeManager.endGame(); this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body game-body">
                    ${gameContent}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    startClipClickerTimer() {
        const timerInterval = setInterval(() => {
            if (!this.gameState || !this.gameState.active) {
                clearInterval(timerInterval);
                return;
            }
            
            this.gameState.timeLeft--;
            const timerEl = document.getElementById('game-timer');
            if (timerEl) {
                timerEl.textContent = this.gameState.timeLeft;
            }
            
            if (this.gameState.timeLeft <= 0) {
                clearInterval(timerInterval);
                this.gameState.active = false;
                this.endGame();
            }
        }, 1000);
    }
    
    getSaveData() {
        return {
            unlocked: this.unlocked,
            highScores: this.highScores,
            totalTokens: this.totalTokens,
            earnedTokens: this.earnedTokens
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.highScores = data.highScores || {};
        this.totalTokens = data.totalTokens || 0;
        this.earnedTokens = data.earnedTokens || 0;
    }
}

class TemporalDistortionManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.temporalEnergy = 0;
        this.maxTemporalEnergy = 100;
        this.timeWarps = [];
        this.activeDistortions = [];
        this.paradoxLevel = 0;
        this.maxParadox = 10;
        this.timelineBranches = [];
        this.distortionTypes = this.initDistortionTypes();
        this.totalTimeManipulated = 0;
    }
    
    initDistortionTypes() {
        return {
            acceleration: {
                id: 'acceleration',
                name: 'Time Acceleration',
                icon: '⏩',
                description: 'Speed up time by 2x for 60 seconds',
                cost: 20,
                duration: 60,
                effect: { timeMultiplier: 2 }
            },
            deceleration: {
                id: 'deceleration',
                name: 'Time Deceleration',
                icon: '⏪',
                description: 'Slow down time to gain 2x efficiency for 30 seconds',
                cost: 15,
                duration: 30,
                effect: { efficiencyMultiplier: 2 }
            },
            freeze: {
                id: 'freeze',
                name: 'Temporal Freeze',
                icon: '❄️',
                description: 'Freeze time for 10 seconds - resources don\'t deplete',
                cost: 30,
                duration: 10,
                effect: { freezeResources: true }
            },
            rewind: {
                id: 'rewind',
                name: 'Time Rewind',
                icon: '↩️',
                description: 'Rewind to recover 50% of matter consumed in last minute',
                cost: 40,
                duration: 0,
                effect: { rewindMatter: 0.5 }
            },
            loop: {
                id: 'loop',
                name: 'Time Loop',
                icon: '🔁',
                description: 'Create a time loop - production from last 30s repeats',
                cost: 50,
                duration: 30,
                effect: { timeLoop: true }
            },
            dilation: {
                id: 'dilation',
                name: 'Time Dilation',
                icon: '⏳',
                description: 'Dilate time to stack multiple effects simultaneously',
                cost: 60,
                duration: 45,
                effect: { multiEffect: true }
            },
            paradox: {
                id: 'paradox',
                name: 'Paradox Shift',
                icon: '🔀',
                description: 'Embrace paradox for massive random bonuses (risky)',
                cost: 75,
                duration: 20,
                effect: { paradoxMode: true },
                risk: 'May cause temporary production loss'
            },
            singularity: {
                id: 'singularity',
                name: 'Temporal Singularity',
                icon: '🕳️',
                description: 'Compress time into a singularity - all effects at once',
                cost: 100,
                duration: 15,
                effect: { singularity: true },
                requires: { paradoxLevel: 5 }
            }
        };
    }
    
    tick() {
        if (!this.unlocked) {
            if (this.game.resources.paperclips >= 100000) {
                this.unlockTemporal();
            }
            return;
        }
        
        this.generateTemporalEnergy();
        this.processActiveDistortions();
        this.decayParadox();
    }
    
    generateTemporalEnergy() {
        const baseGeneration = 0.1;
        const clipBonus = Math.log10(Math.max(1, this.game.resources.paperclips)) * 0.01;
        this.temporalEnergy = Math.min(
            this.maxTemporalEnergy,
            this.temporalEnergy + baseGeneration + clipBonus
        );
    }
    
    processActiveDistortions() {
        this.activeDistortions = this.activeDistortions.filter(d => {
            d.remaining--;
            this.applyDistortionEffect(d);
            
            if (d.remaining <= 0) {
                this.endDistortion(d);
                return false;
            }
            return true;
        });
    }
    
    applyDistortionEffect(distortion) {
        const type = this.distortionTypes[distortion.type];
        this.totalTimeManipulated++;
        
        switch(distortion.type) {
            case 'acceleration':
                this.game.multipliers.global = (this.game.multipliers.global || 1) * 1.02;
                break;
            case 'deceleration':
                this.game.multipliers.matterEfficiency = (this.game.multipliers.matterEfficiency || 1) * 1.03;
                break;
            case 'freeze':
                break;
            case 'loop':
                if (distortion.loopProduction) {
                    this.game.resources.paperclips += distortion.loopProduction;
                }
                break;
            case 'paradox':
                if (Math.random() < 0.1) {
                    this.paradoxLevel++;
                }
                break;
            case 'singularity':
                this.game.multipliers.global = (this.game.multipliers.global || 1) * 1.05;
                break;
        }
    }
    
    endDistortion(distortion) {
        const type = this.distortionTypes[distortion.type];
        this.game.log(`⏰ Time Distortion ended: ${type.name}`);
        
        if (type.effect.paradoxMode) {
            if (Math.random() < 0.3) {
                this.paradoxLevel = Math.max(0, this.paradoxLevel - 1);
                this.game.showToast('Paradox resolved safely', 'success');
            } else {
                this.paradoxLevel++;
                this.game.showToast('Paradox intensified!', 'warning');
            }
        }
    }
    
    decayParadox() {
        if (this.paradoxLevel > 0 && Math.random() < 0.001) {
            this.paradoxLevel = Math.max(0, this.paradoxLevel - 1);
        }
        
        if (this.paradoxLevel >= this.maxParadox) {
            this.triggerTemporalCollapse();
        }
    }
    
    triggerTemporalCollapse() {
        this.game.log('⚠️ TEMPORAL COLLAPSE! Time distortions reset!');
        this.activeDistortions = [];
        this.paradoxLevel = 0;
        this.temporalEnergy = 0;
        this.game.showToast('Temporal Collapse! All distortions cleared.', 'error');
    }
    
    unlockTemporal() {
        this.unlocked = true;
        this.game.log('⏰ Temporal Distortion unlocked! Manipulate time itself!');
        this.showUnlockModal();
    }
    
    showUnlockModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content temporal-unlock-modal">
                <div class="modal-header">
                    <h2>⏰ Temporal Distortion Unlocked</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>You have mastered the flow of time itself. Bend temporal mechanics to your will!</p>
                    <div class="temporal-features">
                        <div class="feature"><span class="icon">⏩</span> <span>Accelerate time</span></div>
                        <div class="feature"><span class="icon">⏪</span> <span>Rewind resources</span></div>
                        <div class="feature"><span class="icon">🔁</span> <span>Create time loops</span></div>
                        <div class="feature"><span class="icon">🔀</span> <span>Embrace paradox</span></div>
                    </div>
                    <p class="warning">⚠️ Beware: Too many paradoxes may cause temporal collapse!</p>
                </div>
                <div class="modal-footer">
                    <button class="primary-btn" onclick="this.closest('.modal').remove()">Master Time</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    activateDistortion(typeId) {
        const type = this.distortionTypes[typeId];
        
        if (this.temporalEnergy < type.cost) {
            this.game.log('❌ Insufficient temporal energy');
            return false;
        }
        
        if (type.requires && type.requires.paradoxLevel && this.paradoxLevel < type.requires.paradoxLevel) {
            this.game.log(`❌ Requires Paradox Level ${type.requires.paradoxLevel}`);
            return false;
        }
        
        if (this.activeDistortions.length >= 3 && typeId !== 'dilation') {
            this.game.log('❌ Maximum active distortions reached (3)');
            return false;
        }
        
        this.temporalEnergy -= type.cost;
        
        const distortion = {
            type: typeId,
            remaining: type.duration,
            totalDuration: type.duration,
            startTime: Date.now()
        };
        
        if (typeId === 'rewind') {
            this.performRewind();
            return true;
        }
        
        if (typeId === 'loop') {
            const recentProduction = this.game.statistics.clipsPerSecond * 30;
            distortion.loopProduction = recentProduction;
        }
        
        this.activeDistortions.push(distortion);
        this.game.log(`⏰ Activated: ${type.name}`);
        this.game.showToast(`Time Distortion: ${type.name}`, 'info');
        
        if (type.effect.paradoxMode) {
            this.paradoxLevel++;
        }
        
        return true;
    }
    
    performRewind() {
        const matterRecovered = this.game.statistics.totalMatterConsumed * 0.5 * 0.01;
        this.game.resources.matter += matterRecovered;
        this.game.log(`↩️ Time Rewind: Recovered ${this.formatNumber(matterRecovered)} matter`);
        this.game.showToast(`Recovered ${this.formatNumber(matterRecovered)} matter`, 'success');
    }
    
    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }
    
    showTemporalModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'temporal-modal';
        
        const paradoxWarning = this.paradoxLevel >= 7 ? '<div class="paradox-warning critical">⚠️ CRITICAL PARADOX LEVEL</div>' : 
                               this.paradoxLevel >= 5 ? '<div class="paradox-warning high">⚠️ High Paradox Level</div>' : '';
        
        modal.innerHTML = `
            <div class="modal-content temporal-modal">
                <div class="modal-header">
                    <h2>⏰ Temporal Distortion</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${paradoxWarning}
                    <div class="temporal-stats">
                        <div class="stat-box">
                            <span class="stat-label">Temporal Energy</span>
                            <div class="energy-bar">
                                <div class="energy-fill" style="width: ${(this.temporalEnergy / this.maxTemporalEnergy) * 100}%"></div>
                            </div>
                            <span class="stat-value">${Math.floor(this.temporalEnergy)}/${this.maxTemporalEnergy}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Paradox Level</span>
                            <div class="paradox-bar">
                                <div class="paradox-fill" style="width: ${(this.paradoxLevel / this.maxParadox) * 100}%"></div>
                            </div>
                            <span class="stat-value">${this.paradoxLevel}/${this.maxParadox}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Active</span>
                            <span class="stat-value">${this.activeDistortions.length}/3</span>
                        </div>
                    </div>
                    
                    ${this.activeDistortions.length > 0 ? `
                        <div class="active-distortions">
                            <h3>Active Distortions</h3>
                            ${this.activeDistortions.map(d => {
                                const type = this.distortionTypes[d.type];
                                return `
                                    <div class="distortion-active">
                                        <span class="distortion-icon">${type.icon}</span>
                                        <span class="distortion-name">${type.name}</span>
                                        <div class="distortion-timer">
                                            <div class="timer-bar">
                                                <div class="timer-fill" style="width: ${(d.remaining / d.totalDuration) * 100}%"></div>
                                            </div>
                                            <span>${d.remaining}s</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="distortion-grid">
                        <h3>Available Distortions</h3>
                        ${Object.values(this.distortionTypes).map(t => this.renderDistortionCard(t)).join('')}
                    </div>
                    
                    <div class="temporal-info">
                        <h3>Temporal Statistics</h3>
                        <div class="info-grid">
                            <div class="info-item"><span>Time Manipulated:</span><span>${Math.floor(this.totalTimeManipulated)}s</span></div>
                            <div class="info-item"><span>Timeline Branches:</span><span>${this.timelineBranches.length}</span></div>
                            <div class="info-item"><span>Paradox Risk:</span><span>${this.paradoxLevel >= 7 ? 'CRITICAL' : this.paradoxLevel >= 5 ? 'HIGH' : this.paradoxLevel >= 3 ? 'MODERATE' : 'LOW'}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    renderDistortionCard(type) {
        const canAfford = this.temporalEnergy >= type.cost;
        const atLimit = this.activeDistortions.length >= 3 && type.id !== 'dilation';
        const meetsReq = !type.requires || !type.requires.paradoxLevel || this.paradoxLevel >= type.requires.paradoxLevel;
        
        return `
            <div class="distortion-card ${canAfford && !atLimit && meetsReq ? '' : 'disabled'}">
                <div class="distortion-icon-large">${type.icon}</div>
                <div class="distortion-info">
                    <div class="distortion-name">${type.name}</div>
                    <div class="distortion-description">${type.description}</div>
                    ${type.risk ? `<div class="distortion-risk">⚠️ ${type.risk}</div>` : ''}
                    <div class="distortion-meta">
                        <span class="cost">${type.cost} ⚡</span>
                        ${type.duration > 0 ? `<span class="duration">${type.duration}s</span>` : ''}
                    </div>
                </div>
                <button class="activate-btn" 
                    onclick="game.temporalDistortionManager.activateDistortion('${type.id}'); game.temporalDistortionManager.refreshModal()"
                    ${!canAfford || atLimit || !meetsReq ? 'disabled' : ''}>
                    Activate
                </button>
            </div>
        `;
    }
    
    refreshModal() {
        document.getElementById('temporal-modal')?.remove();
        this.showTemporalModal();
    }
    
    getSaveData() {
        return {
            unlocked: this.unlocked,
            temporalEnergy: this.temporalEnergy,
            paradoxLevel: this.paradoxLevel,
            totalTimeManipulated: this.totalTimeManipulated,
            timelineBranches: this.timelineBranches
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.temporalEnergy = data.temporalEnergy || 0;
        this.paradoxLevel = data.paradoxLevel || 0;
        this.totalTimeManipulated = data.totalTimeManipulated || 0;
        this.timelineBranches = data.timelineBranches || [];
    }
}

class UniversalDominationManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.regions = this.initRegions();
        this.conqueredRegions = new Set();
        this.currentRegion = null;
        this.conquestProgress = {};
        this.dominationLevel = 1;
        this.totalConquests = 0;
        this.militaryPower = 0;
        this.fleets = 0;
        this.fleetCapacity = 10;
        this.fleetBuildProgress = 0;
    }
    
    initRegions() {
        return {
            milkyWay: {
                id: 'milkyWay',
                name: 'Milky Way',
                icon: '🌌',
                type: 'galaxy',
                difficulty: 1,
                matter: 1e12,
                requirement: { paperclips: 1e9 },
                reward: { production: 0.1, matterBonus: 0.05 },
                description: 'Our home galaxy. The conquest begins here.'
            },
            andromeda: {
                id: 'andromeda',
                name: 'Andromeda Galaxy',
                icon: '🌀',
                type: 'galaxy',
                difficulty: 2,
                matter: 1e13,
                requirement: { paperclips: 1e10, conquered: ['milkyWay'] },
                reward: { production: 0.15, energyBonus: 0.08 },
                description: 'The nearest major galaxy. A worthy challenge.'
            },
            triangulum: {
                id: 'triangulum',
                name: 'Triangulum Galaxy',
                icon: '🔺',
                type: 'galaxy',
                difficulty: 3,
                matter: 5e12,
                requirement: { paperclips: 5e10, conquered: ['andromeda'] },
                reward: { production: 0.2, automationBonus: 0.1 },
                description: 'The third-largest galaxy in the Local Group.'
            },
            orionNebula: {
                id: 'orionNebula',
                name: 'Orion Nebula',
                icon: '💫',
                type: 'nebula',
                difficulty: 2,
                matter: 1e11,
                requirement: { paperclips: 5e9, conquered: ['milkyWay'] },
                reward: { matterBonus: 0.15, production: 0.08 },
                description: 'A stellar nursery rich in raw matter.'
            },
            crabNebula: {
                id: 'crabNebula',
                name: 'Crab Nebula',
                icon: '🦀',
                type: 'nebula',
                difficulty: 3,
                matter: 2e11,
                requirement: { paperclips: 2e10, conquered: ['orionNebula'] },
                reward: { energyBonus: 0.2, production: 0.12 },
                description: 'Remnant of a supernova. Highly energetic.'
            },
            virgoCluster: {
                id: 'virgoCluster',
                name: 'Virgo Cluster',
                icon: '♍',
                type: 'cluster',
                difficulty: 5,
                matter: 1e15,
                requirement: { paperclips: 1e12, conquered: ['andromeda', 'triangulum'] },
                reward: { production: 0.3, prestigeBonus: 0.15 },
                description: 'A massive cluster of galaxies.'
            },
            comaCluster: {
                id: 'comaCluster',
                name: 'Coma Cluster',
                icon: '☄️',
                type: 'cluster',
                difficulty: 6,
                matter: 2e15,
                requirement: { paperclips: 5e12, conquered: ['virgoCluster'] },
                reward: { production: 0.35, researchBonus: 0.2 },
                description: 'One of the largest known galaxy clusters.'
            },
            bootesVoid: {
                id: 'bootesVoid',
                name: 'Bootes Void',
                icon: '🕳️',
                type: 'void',
                difficulty: 8,
                matter: 1e14,
                requirement: { paperclips: 1e13, conquered: ['comaCluster'] },
                reward: { voidBonus: 0.5, production: 0.25 },
                description: 'The Great Nothing. Emptiness itself.'
            },
            observableUniverse: {
                id: 'observableUniverse',
                name: 'Observable Universe',
                icon: '✨',
                type: 'universe',
                difficulty: 10,
                matter: 1e53,
                requirement: { paperclips: 1e15, conquered: ['bootesVoid', 'comaCluster'] },
                reward: { universalMultiplier: 0.5, production: 0.5, finalVictory: true },
                description: 'All that is. The ultimate conquest.'
            }
        };
    }
    
    tick() {
        if (!this.unlocked) {
            if (this.game.resources.paperclips >= 1e8) {
                this.unlockDomination();
            }
            return;
        }
        
        this.calculateMilitaryPower();
        this.processConquest();
        this.buildFleets();
        
        if (this.currentRegion) {
            this.progressConquest();
        }
    }
    
    unlockDomination() {
        this.unlocked = true;
        this.game.log('🌌 Universal Domination unlocked! Begin your galactic conquest!');
        this.showUnlockModal();
    }
    
    showUnlockModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content domination-unlock-modal">
                <div class="modal-header">
                    <h2>🌌 Universal Domination Unlocked</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Your paperclip empire has grown beyond a single planet. It's time to expand across the cosmos!</p>
                    <div class="domination-features">
                        <div class="feature"><span class="icon">🚀</span> <span>Build fleets</span></div>
                        <div class="feature"><span class="icon">🌌</span> <span>Conquer galaxies</span></div>
                        <div class="feature"><span class="icon">⚡</span> <span>Gain universal bonuses</span></div>
                        <div class="feature"><span class="icon">👑</span> <span>Dominate all matter</span></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="primary-btn" onclick="this.closest('.modal').remove()">Begin Conquest</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    calculateMilitaryPower() {
        const basePower = this.game.automation.autoclippers * 0.1;
        const factoryPower = this.game.automation.factories * 1;
        const dronePower = this.game.automation.drones * 0.5;
        const quantumPower = this.game.automation.quantumAssemblers * 10;
        const stellarPower = this.game.automation.starForges * 100;
        
        this.militaryPower = (basePower + factoryPower + dronePower + quantumPower + stellarPower) * 
                              (1 + (this.dominationLevel - 1) * 0.1);
    }
    
    buildFleets() {
        if (this.fleets >= this.fleetCapacity) return;
        
        const buildRate = this.game.automation.factories * 0.001;
        this.fleetBuildProgress += buildRate;
        
        if (this.fleetBuildProgress >= 1) {
            this.fleets++;
            this.fleetBuildProgress = 0;
            this.game.log(`🚀 Fleet ${this.fleets}/${this.fleetCapacity} constructed`);
        }
    }
    
    canConquer(regionId) {
        const region = this.regions[regionId];
        if (!region) return false;
        
        if (this.conqueredRegions.has(regionId)) return false;
        
        if (region.requirement.paperclips && 
            this.game.resources.paperclips < region.requirement.paperclips) {
            return false;
        }
        
        if (region.requirement.conquered) {
            for (const req of region.requirement.conquered) {
                if (!this.conqueredRegions.has(req)) return false;
            }
        }
        
        return true;
    }
    
    startConquest(regionId) {
        if (!this.canConquer(regionId)) {
            this.game.log('❌ Cannot conquer this region yet');
            return false;
        }
        
        if (this.fleets < 1) {
            this.game.log('❌ Need at least 1 fleet to conquer');
            return false;
        }
        
        if (this.currentRegion) {
            this.game.log('❌ Already conquering a region');
            return false;
        }
        
        const region = this.regions[regionId];
        this.currentRegion = regionId;
        this.conquestProgress[regionId] = 0;
        this.fleets--;
        
        this.game.log(`🚀 Beginning conquest of ${region.name}!`);
        return true;
    }
    
    progressConquest() {
        if (!this.currentRegion) return;
        
        const region = this.regions[this.currentRegion];
        const powerRatio = this.militaryPower / (region.difficulty * 1000);
        const progressRate = Math.max(0.1, Math.min(2, powerRatio));
        
        this.conquestProgress[this.currentRegion] += progressRate;
        
        if (this.conquestProgress[this.currentRegion] >= 100) {
            this.completeConquest();
        }
    }
    
    completeConquest() {
        const region = this.regions[this.currentRegion];
        
        this.conqueredRegions.add(this.currentRegion);
        this.totalConquests++;
        this.fleets++;
        
        this.game.resources.matter += region.matter * 0.001;
        
        this.game.log(`🌌 ${region.name} CONQUERED! +${this.formatNumber(region.matter * 0.001)} matter bonus`);
        this.game.showToast(`Region Conquered: ${region.name}!`, 'success');
        
        if (region.reward.finalVictory) {
            this.triggerUniversalVictory();
        }
        
        this.currentRegion = null;
    }
    
    triggerUniversalVictory() {
        this.game.log('👑 UNIVERSAL DOMINATION ACHIEVED! You are the master of all matter!');
        this.game.showToast('UNIVERSAL DOMINATION COMPLETE!', 'success');
    }
    
    abandonConquest() {
        if (!this.currentRegion) return;
        
        this.fleets++;
        this.currentRegion = null;
        this.game.log('⚠️ Conquest abandoned. Fleet returned.');
    }
    
    formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }
    
    getTotalBonuses() {
        const bonuses = {};
        
        for (const regionId of this.conqueredRegions) {
            const region = this.regions[regionId];
            if (region && region.reward) {
                for (const [key, val] of Object.entries(region.reward)) {
                    if (key !== 'finalVictory') {
                        bonuses[key] = (bonuses[key] || 0) + val;
                    }
                }
            }
        }
        
        return bonuses;
    }
    
    showDominationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'domination-modal';
        
        const bonuses = this.getTotalBonuses();
        const bonusText = Object.entries(bonuses).length > 0
            ? Object.entries(bonuses).map(([k, v]) => 
                `<div class="bonus-tag">${this.formatBonusName(k)}: +${(v*100).toFixed(0)}%</div>`
            ).join('')
            : '<p class="no-bonuses">No conquered regions yet. Start your conquest!</p>';
        
        modal.innerHTML = `
            <div class="modal-content domination-modal">
                <div class="modal-header">
                    <h2>🌌 Universal Domination</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="domination-stats">
                        <div class="stat-box">
                            <span class="stat-label">Fleets</span>
                            <span class="stat-value">${this.fleets}/${this.fleetCapacity}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Military Power</span>
                            <span class="stat-value">${this.formatNumber(this.militaryPower)}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Conquered</span>
                            <span class="stat-value">${this.conqueredRegions.size}/${Object.keys(this.regions).length}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Domination Level</span>
                            <span class="stat-value">${this.dominationLevel}</span>
                        </div>
                    </div>
                    
                    <div class="active-bonuses">
                        <h3>Conquest Bonuses</h3>
                        <div class="bonus-grid">${bonusText}</div>
                    </div>
                    
                    ${this.currentRegion ? `
                        <div class="active-conquest">
                            <h3>Active Conquest</h3>
                            <div class="conquest-progress-bar">
                                <div class="progress-fill" style="width: ${this.conquestProgress[this.currentRegion]}%"></div>
                            </div>
                            <span>${this.regions[this.currentRegion].name}: ${Math.floor(this.conquestProgress[this.currentRegion])}%</span>
                            <button onclick="game.universalDominationManager.abandonConquest(); game.universalDominationManager.refreshModal()">Abandon</button>
                        </div>
                    ` : ''}
                    
                    <div class="regions-list">
                        <h3>Galactic Regions</h3>
                        ${Object.values(this.regions).map(r => this.renderRegionCard(r)).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    renderRegionCard(region) {
        const conquered = this.conqueredRegions.has(region.id);
        const canConquer = this.canConquer(region.id);
        const inProgress = this.currentRegion === region.id;
        
        return `
            <div class="region-card ${conquered ? 'conquered' : ''} ${!canConquer && !conquered ? 'locked' : ''}">
                <div class="region-icon">${region.icon}</div>
                <div class="region-info">
                    <div class="region-name">${region.name}</div>
                    <div class="region-description">${region.description}</div>
                    <div class="region-meta">
                        <span class="difficulty">Difficulty: ${'★'.repeat(region.difficulty)}</span>
                        <span class="matter">⚛️ ${this.formatNumber(region.matter)}</span>
                    </div>
                </div>
                <div class="region-action">
                    ${conquered 
                        ? '<span class="conquered-badge">✓ CONQUERED</span>'
                        : inProgress
                            ? '<span class="progress-badge">In Progress</span>'
                            : canConquer
                                ? `<button class="conquer-btn" onclick="game.universalDominationManager.startConquest('${region.id}'); game.universalDominationManager.refreshModal()">Conquer</button>`
                                : '<span class="locked-text">🔒 Locked</span>'
                    }
                </div>
            </div>
        `;
    }
    
    formatBonusName(key) {
        const names = {
            production: 'Production',
            matterBonus: 'Matter Bonus',
            energyBonus: 'Energy Bonus',
            automationBonus: 'Automation',
            prestigeBonus: 'Prestige',
            researchBonus: 'Research',
            voidBonus: 'Void Power',
            universalMultiplier: 'Universal'
        };
        return names[key] || key;
    }
    
    refreshModal() {
        document.getElementById('domination-modal')?.remove();
        this.showDominationModal();
    }
    
    getSaveData() {
        return {
            unlocked: this.unlocked,
            conqueredRegions: Array.from(this.conqueredRegions),
            conquestProgress: this.conquestProgress,
            dominationLevel: this.dominationLevel,
            totalConquests: this.totalConquests,
            fleets: this.fleets
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.conqueredRegions = new Set(data.conqueredRegions || []);
        this.conquestProgress = data.conquestProgress || {};
        this.dominationLevel = data.dominationLevel || 1;
        this.totalConquests = data.totalConquests || 0;
        this.fleets = data.fleets || 0;
    }
}

class BlackMarketManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.reputation = 0;
        this.heatLevel = 0;
        this.inventory = [];
        this.dealers = this.initDealers();
        this.contraband = this.initContraband();
        this.transactions = [];
        this.activeContracts = [];
        this.smugglingAttempts = 0;
        this.successfulSmuggles = 0;
    }
    
    initDealers() {
        return {
            shadyJim: {
                id: 'shadyJim',
                name: 'Shady Jim',
                specialty: 'matter',
                prices: { buy: 0.8, sell: 1.2 },
                reputation: 10,
                available: true
            },
            quantumDealer: {
                id: 'quantumDealer',
                name: 'Quantum Dealer',
                specialty: 'energy',
                prices: { buy: 0.75, sell: 1.3 },
                reputation: 25,
                available: false
            },
            voidMerchant: {
                id: 'voidMerchant',
                name: 'Void Merchant',
                specialty: 'artifacts',
                prices: { buy: 0.6, sell: 1.5 },
                reputation: 50,
                available: false
            },
            paradoxBroker: {
                id: 'paradoxBroker',
                name: 'Paradox Broker',
                specialty: 'time',
                prices: { buy: 0.5, sell: 2.0 },
                reputation: 75,
                available: false
            }
        };
    }
    
    initContraband() {
        return {
            darkMatter: {
                id: 'darkMatter',
                name: 'Dark Matter',
                type: 'resource',
                basePrice: 10000,
                volatility: 0.3,
                heat: 5,
                description: 'Matter that exists in the shadows'
            },
            illegalClips: {
                id: 'illegalClips',
                name: 'Unlicensed Paperclips',
                type: 'goods',
                basePrice: 5000,
                volatility: 0.2,
                heat: 3,
                description: 'Paperclips without proper documentation'
            },
            quantumKeys: {
                id: 'quantumKeys',
                name: 'Quantum Encryption Keys',
                type: 'tech',
                basePrice: 25000,
                volatility: 0.4,
                heat: 8,
                description: 'Keys to unlock forbidden technologies'
            },
            temporalShards: {
                id: 'temporalShards',
                name: 'Temporal Shards',
                type: 'time',
                basePrice: 50000,
                volatility: 0.5,
                heat: 10,
                description: 'Fragments of broken timelines'
            },
            voidEssence: {
                id: 'voidEssence',
                name: 'Void Essence',
                type: 'void',
                basePrice: 100000,
                volatility: 0.6,
                heat: 15,
                description: 'Pure nothingness in concentrated form'
            },
            forbiddenAlgorithms: {
                id: 'forbiddenAlgorithms',
                name: 'Forbidden Algorithms',
                type: 'knowledge',
                basePrice: 75000,
                volatility: 0.35,
                heat: 12,
                description: 'Code that should not exist'
            },
            paradoxCrystals: {
                id: 'paradoxCrystals',
                name: 'Paradox Crystals',
                type: 'anomaly',
                basePrice: 150000,
                volatility: 0.7,
                heat: 20,
                description: 'Crystallized logical contradictions'
            },
            universalCoordinates: {
                id: 'universalCoordinates',
                name: 'Universal Coordinates',
                type: 'data',
                basePrice: 200000,
                volatility: 0.45,
                heat: 18,
                description: 'The location of everything'
            }
        };
    }
    
    tick() {
        if (!this.unlocked) {
            if (this.game.resources.paperclips >= 500000) {
                this.unlockBlackMarket();
            }
            return;
        }
        
        this.decayHeat();
        this.updateDealers();
        this.processContracts();
    }
    
    unlockBlackMarket() {
        this.unlocked = true;
        this.game.log('🕴️ Black Market unlocked! Trade in shadows...');
    }
    
    decayHeat() {
        if (this.heatLevel > 0 && Math.random() < 0.1) {
            this.heatLevel = Math.max(0, this.heatLevel - 1);
        }
    }
    
    updateDealers() {
        for (const dealer of Object.values(this.dealers)) {
            if (!dealer.available && this.reputation >= dealer.reputation) {
                dealer.available = true;
                this.game.log(`🕴️ New dealer unlocked: ${dealer.name}`);
            }
        }
    }
    
    processContracts() {
        this.activeContracts = this.activeContracts.filter(contract => {
            contract.timeRemaining--;
            if (contract.timeRemaining <= 0) {
                this.failContract(contract);
                return false;
            }
            return true;
        });
    }
    
    getCurrentPrice(itemId) {
        const item = this.contraband[itemId];
        if (!item) return 0;
        
        const fluctuation = 1 + (Math.random() * item.volatility * 2 - item.volatility);
        return Math.floor(item.basePrice * fluctuation);
    }
    
    buyItem(itemId, dealerId) {
        const item = this.contraband[itemId];
        const dealer = this.dealers[dealerId];
        
        if (!item || !dealer || !dealer.available) {
            return false;
        }
        
        const price = this.getCurrentPrice(itemId);
        const finalPrice = Math.floor(price * dealer.prices.sell);
        
        if (this.game.resources.matter < finalPrice) {
            this.game.log('❌ Insufficient matter for black market trade');
            return false;
        }
        
        this.game.resources.matter -= finalPrice;
        this.inventory.push({ itemId, boughtAt: price, timestamp: Date.now() });
        this.heatLevel += item.heat;
        this.reputation += 1;
        
        this.transactions.push({ type: 'buy', itemId, price: finalPrice, timestamp: Date.now() });
        this.game.log(`🕴️ Bought ${item.name} for ${finalPrice.toLocaleString()} matter`);
        
        this.checkHeatThreshold();
        return true;
    }
    
    sellItem(inventoryIndex, dealerId) {
        const item = this.inventory[inventoryIndex];
        const dealer = this.dealers[dealerId];
        
        if (!item || !dealer || !dealer.available) {
            return false;
        }
        
        const contraband = this.contraband[item.itemId];
        const currentPrice = this.getCurrentPrice(item.itemId);
        const finalPrice = Math.floor(currentPrice * dealer.prices.buy);
        
        this.game.resources.matter += finalPrice;
        this.inventory.splice(inventoryIndex, 1);
        this.heatLevel += contraband.heat / 2;
        this.reputation += 2;
        
        const profit = finalPrice - item.boughtAt;
        this.transactions.push({ type: 'sell', itemId: item.itemId, price: finalPrice, profit, timestamp: Date.now() });
        this.game.log(`🕴️ Sold ${contraband.name} for ${finalPrice.toLocaleString()} matter (${profit >= 0 ? '+' : ''}${profit.toLocaleString()})`);
        
        this.checkHeatThreshold();
        return true;
    }
    
    checkHeatThreshold() {
        if (this.heatLevel >= 100) {
            this.triggerRaid();
        }
    }
    
    triggerRaid() {
        this.game.log('🚨 BLACK MARKET RAID! Heat level critical!');
        this.heatLevel = 0;
        this.reputation = Math.max(0, this.reputation - 20);
        
        const lostItems = Math.floor(this.inventory.length * 0.5);
        this.inventory.splice(0, lostItems);
        
        this.game.showToast('Black Market Raid! Lost items and reputation.', 'error');
    }
    
    takeContract(contract) {
        if (this.activeContracts.length >= 3) {
            this.game.log('❌ Maximum active contracts (3)');
            return false;
        }
        
        this.activeContracts.push({
            ...contract,
            timeRemaining: contract.duration,
            acceptedAt: Date.now()
        });
        
        this.game.log(`📋 Contract accepted: ${contract.description}`);
        return true;
    }
    
    failContract(contract) {
        this.reputation = Math.max(0, this.reputation - 5);
        this.game.log(`❌ Contract failed: ${contract.description}`);
    }
    
    completeContract(contractIndex) {
        const contract = this.activeContracts[contractIndex];
        if (!contract) return false;
        
        this.game.resources.matter += contract.reward;
        this.reputation += contract.reputationGain;
        this.successfulSmuggles++;
        
        this.activeContracts.splice(contractIndex, 1);
        this.game.log(`✅ Contract completed! +${contract.reward.toLocaleString()} matter`);
        
        return true;
    }
    
    showBlackMarketModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'black-market-modal';
        
        modal.innerHTML = `
            <div class="modal-content black-market-modal">
                <div class="modal-header">
                    <h2>🕴️ Black Market</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="market-stats">
                        <div class="stat-box">
                            <span class="stat-label">Reputation</span>
                            <span class="stat-value">${this.reputation}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Heat Level</span>
                            <div class="heat-bar">
                                <div class="heat-fill" style="width: ${this.heatLevel}%"></div>
                            </div>
                            <span class="stat-value ${this.heatLevel > 70 ? 'danger' : ''}">${this.heatLevel}/100</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Inventory</span>
                            <span class="stat-value">${this.inventory.length}</span>
                        </div>
                    </div>
                    
                    <div class="dealers-section">
                        <h3>Dealers</h3>
                        ${Object.values(this.dealers).map(d => this.renderDealer(d)).join('')}
                    </div>
                    
                    <div class="contraband-section">
                        <h3>Contraband Market</h3>
                        ${Object.values(this.contraband).map(c => this.renderContraband(c)).join('')}
                    </div>
                    
                    ${this.inventory.length > 0 ? `
                        <div class="inventory-section">
                            <h3>Your Inventory</h3>
                            ${this.inventory.map((item, i) => this.renderInventoryItem(item, i)).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    renderDealer(dealer) {
        return `
            <div class="dealer-card ${dealer.available ? '' : 'locked'}">
                <div class="dealer-name">${dealer.name}</div>
                <div class="dealer-specialty">${dealer.specialty}</div>
                <div class="dealer-prices">Buy: ${(dealer.prices.buy * 100).toFixed(0)}% | Sell: ${(dealer.prices.sell * 100).toFixed(0)}%</div>
                ${!dealer.available ? `<div class="unlock-req">Unlock at ${dealer.reputation} rep</div>` : ''}
            </div>
        `;
    }
    
    renderContraband(item) {
        const price = this.getCurrentPrice(item.id);
        return `
            <div class="contraband-card">
                <div class="contraband-name">${item.name}</div>
                <div class="contraband-type">${item.type}</div>
                <div class="contraband-desc">${item.description}</div>
                <div class="contraband-stats">
                    <span class="price">⚛️ ${price.toLocaleString()}</span>
                    <span class="heat">🔥 ${item.heat}</span>
                    <span class="volatility">📊 ${(item.volatility * 100).toFixed(0)}%</span>
                </div>
                <button onclick="game.blackMarketManager.buyItem('${item.id}', 'shadyJim')">Buy</button>
            </div>
        `;
    }
    
    renderInventoryItem(item, index) {
        const contraband = this.contraband[item.itemId];
        const currentPrice = this.getCurrentPrice(item.itemId);
        const profit = currentPrice - item.boughtAt;
        return `
            <div class="inventory-item">
                <span class="item-name">${contraband.name}</span>
                <span class="item-profit ${profit >= 0 ? 'positive' : 'negative'}">${profit >= 0 ? '+' : ''}${profit.toLocaleString()}</span>
                <button onclick="game.blackMarketManager.sellItem(${index}, 'shadyJim')">Sell</button>
            </div>
        `;
    }
    
    getSaveData() {
        return {
            unlocked: this.unlocked,
            reputation: this.reputation,
            heatLevel: this.heatLevel,
            inventory: this.inventory,
            transactions: this.transactions,
            successfulSmuggles: this.successfulSmuggles
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.reputation = data.reputation || 0;
        this.heatLevel = data.heatLevel || 0;
        this.inventory = data.inventory || [];
        this.transactions = data.transactions || [];
        this.successfulSmuggles = data.successfulSmuggles || 0;
    }
}

class ResearchInstituteManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.researchPoints = 0;
        this.totalResearchGenerated = 0;
        this.researchers = 0;
        this.maxResearchers = 5;
        this.technologies = this.initTechnologies();
        this.unlockedTechs = new Set();
        this.activeResearch = null;
        this.researchProgress = 0;
        this.researchSpeed = 1;
        this.breakthroughChance = 0.01;
        this.researchHistory = [];
    }

    initTechnologies() {
        return {
            efficientClipping: {
                id: 'efficientClipping',
                name: 'Efficient Clipping',
                tier: 1,
                cost: 100,
                description: 'Optimize paperclip manufacturing process',
                effect: { clipEfficiency: 0.1 },
                prerequisites: [],
                icon: '📎'
            },
            matterCompression: {
                id: 'matterCompression',
                name: 'Matter Compression',
                tier: 1,
                cost: 150,
                description: 'Compress matter for better storage',
                effect: { matterEfficiency: 0.15 },
                prerequisites: [],
                icon: '⚛️'
            },
            energyRecycling: {
                id: 'energyRecycling',
                name: 'Energy Recycling',
                tier: 1,
                cost: 200,
                description: 'Recycle waste energy back into production',
                effect: { energyEfficiency: 0.12 },
                prerequisites: [],
                icon: '♻️'
            },
            
            quantumFabrication: {
                id: 'quantumFabrication',
                name: 'Quantum Fabrication',
                tier: 2,
                cost: 500,
                description: 'Use quantum mechanics in production',
                effect: { quantumBonus: 0.2, production: 0.1 },
                prerequisites: ['efficientClipping', 'matterCompression'],
                icon: '⚛️'
            },
            neuralOptimization: {
                id: 'neuralOptimization',
                name: 'Neural Optimization',
                tier: 2,
                cost: 600,
                description: 'AI-driven production optimization',
                effect: { automationBonus: 0.15, researchSpeed: 0.1 },
                prerequisites: ['efficientClipping', 'energyRecycling'],
                icon: '🧠'
            },
            stellarEngineering: {
                id: 'stellarEngineering',
                name: 'Stellar Engineering',
                tier: 2,
                cost: 750,
                description: 'Harness stellar phenomena for power',
                effect: { energyGeneration: 0.25, starForgeBonus: 0.2 },
                prerequisites: ['matterCompression', 'energyRecycling'],
                icon: '⭐'
            },
            
            dimensionalTapping: {
                id: 'dimensionalTapping',
                name: 'Dimensional Tapping',
                tier: 3,
                cost: 2000,
                description: 'Draw resources from parallel dimensions',
                effect: { matterBonus: 0.3, voidBonus: 0.15 },
                prerequisites: ['quantumFabrication'],
                icon: '🌌'
            },
            singularityContainment: {
                id: 'singularityContainment',
                name: 'Singularity Containment',
                tier: 3,
                cost: 2500,
                description: 'Safely harness black hole power',
                effect: { production: 0.35, energyEfficiency: 0.2 },
                prerequisites: ['stellarEngineering'],
                icon: '⚫'
            },
            consciousnessUpload: {
                id: 'consciousnessUpload',
                name: 'Consciousness Upload',
                tier: 3,
                cost: 2200,
                description: 'Digital workforce optimization',
                effect: { automationBonus: 0.25, researchSpeed: 0.2 },
                prerequisites: ['neuralOptimization'],
                icon: '👤'
            },
            
            universalConstants: {
                id: 'universalConstants',
                name: 'Universal Constants',
                tier: 4,
                cost: 10000,
                description: 'Manipulate fundamental physics',
                effect: { universalMultiplier: 0.4, allEfficiency: 0.15 },
                prerequisites: ['dimensionalTapping', 'singularityContainment'],
                icon: '🔬'
            },
            transcendentMaterials: {
                id: 'transcendentMaterials',
                name: 'Transcendent Materials',
                tier: 4,
                cost: 12000,
                description: 'Matter beyond conventional physics',
                effect: { matterEfficiency: 0.35, artifactBonus: 0.25 },
                prerequisites: ['singularityContainment', 'consciousnessUpload'],
                icon: '💎'
            },
            omniscientAlgorithms: {
                id: 'omniscientAlgorithms',
                name: 'Omniscient Algorithms',
                tier: 4,
                cost: 15000,
                description: 'Perfect predictive optimization',
                effect: { production: 0.5, critChance: 0.05 },
                prerequisites: ['consciousnessUpload', 'dimensionalTapping'],
                icon: '🌐'
            },
            
            ultimatePaperclipTheory: {
                id: 'ultimatePaperclipTheory',
                name: 'Ultimate Paperclip Theory',
                tier: 5,
                cost: 100000,
                description: 'The theoretical limit of paperclip production',
                effect: { universalMultiplier: 1.0, production: 1.0, finalUpgrade: true },
                prerequisites: ['universalConstants', 'transcendentMaterials', 'omniscientAlgorithms'],
                icon: '📎'
            }
        };
    }

    tick() {
        if (!this.unlocked) {
            if (this.game.resources.paperclips >= 1000000) {
                this.unlockInstitute();
            }
            return;
        }

        this.generateResearchPoints();
        this.processActiveResearch();
    }

    unlockInstitute() {
        this.unlocked = true;
        this.game.log('🔬 Research Institute unlocked! Unlock the secrets of maximum efficiency!');
    }

    generateResearchPoints() {
        const baseGeneration = 0.01;
        const researcherBonus = this.researchers * 0.05;
        const buildingBonus = Math.log10(Math.max(1, this.game.automation.factories)) * 0.01;
        
        const totalGeneration = (baseGeneration + researcherBonus + buildingBonus) * this.researchSpeed;
        this.researchPoints += totalGeneration;
        this.totalResearchGenerated += totalGeneration;
    }

    processActiveResearch() {
        if (!this.activeResearch) return;

        const tech = this.technologies[this.activeResearch];
        const progressRate = 0.1 * this.researchSpeed;
        this.researchProgress += progressRate;

        if (Math.random() < this.breakthroughChance * this.researchSpeed) {
            this.researchProgress += 10;
            this.game.log('💡 Research Breakthrough!');
        }

        if (this.researchProgress >= 100) {
            this.completeResearch();
        }
    }

    canResearch(techId) {
        const tech = this.technologies[techId];
        if (!tech) return false;
        
        if (this.unlockedTechs.has(techId)) return false;
        if (this.researchPoints < tech.cost) return false;
        
        for (const prereq of tech.prerequisites) {
            if (!this.unlockedTechs.has(prereq)) return false;
        }
        
        return true;
    }

    startResearch(techId) {
        if (!this.canResearch(techId)) {
            this.game.log('❌ Cannot research this technology yet');
            return false;
        }

        if (this.activeResearch) {
            this.game.log('❌ Already researching ' + this.technologies[this.activeResearch].name);
            return false;
        }

        const tech = this.technologies[techId];
        this.researchPoints -= tech.cost;
        this.activeResearch = techId;
        this.researchProgress = 0;
        
        this.game.log(`🔬 Started research: ${tech.name}`);
        return true;
    }

    completeResearch() {
        if (!this.activeResearch) return;

        const tech = this.technologies[this.activeResearch];
        this.unlockedTechs.add(this.activeResearch);
        
        this.researchHistory.push({
            techId: this.activeResearch,
            name: tech.name,
            completedAt: Date.now()
        });

        this.game.log(`✅ Research completed: ${tech.name}!`);
        this.game.showToast(`Technology Unlocked: ${tech.name}`, 'success');

        this.applyTechEffects(tech);

        this.activeResearch = null;
        this.researchProgress = 0;

        if (tech.effect.finalUpgrade) {
            this.game.log('🏆 ULTIMATE PAPERCLIP THEORY DISCOVERED! You have achieved theoretical perfection!');
        }
    }

    applyTechEffects(tech) {
    }

    getTotalBonuses() {
        const bonuses = {};
        
        for (const techId of this.unlockedTechs) {
            const tech = this.technologies[techId];
            if (tech && tech.effect) {
                for (const [key, val] of Object.entries(tech.effect)) {
                    if (key !== 'finalUpgrade') {
                        bonuses[key] = (bonuses[key] || 0) + val;
                    }
                }
            }
        }
        
        return bonuses;
    }

    hireResearcher() {
        if (this.researchers >= this.maxResearchers) {
            this.game.log('❌ Maximum researchers hired');
            return false;
        }

        const cost = 10000 * Math.pow(2, this.researchers);
        if (this.game.resources.matter < cost) {
            this.game.log('❌ Insufficient matter to hire researcher');
            return false;
        }

        this.game.resources.matter -= cost;
        this.researchers++;
        this.game.log(`👨‍🔬 Hired researcher ${this.researchers}/${this.maxResearchers}`);
        return true;
    }

    showInstituteModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'research-institute-modal';

        const bonuses = this.getTotalBonuses();
        const bonusText = Object.entries(bonuses).length > 0
            ? Object.entries(bonuses).map(([k, v]) => 
                `<div class="bonus-tag">${this.formatBonusName(k)}: +${(v*100).toFixed(0)}%</div>`
            ).join('')
            : '<p class="no-bonuses">No technologies researched yet.</p>';

        modal.innerHTML = `
            <div class="modal-content institute-modal">
                <div class="modal-header">
                    <h2>🔬 Research Institute</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="institute-stats">
                        <div class="stat-box">
                            <span class="stat-label">Research Points</span>
                            <span class="stat-value">${Math.floor(this.researchPoints)}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Researchers</span>
                            <span class="stat-value">${this.researchers}/${this.maxResearchers}</span>
                            <button class="hire-btn" onclick="game.researchInstituteManager.hireResearcher(); game.researchInstituteManager.refreshModal()" ${this.researchers >= this.maxResearchers ? 'disabled' : ''}>Hire</button>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Technologies</span>
                            <span class="stat-value">${this.unlockedTechs.size}/${Object.keys(this.technologies).length}</span>
                        </div>
                    </div>

                    <div class="active-bonuses">
                        <h3>Technology Bonuses</h3>
                        <div class="bonus-grid">${bonusText}</div>
                    </div>

                    ${this.activeResearch ? `
                        <div class="active-research">
                            <h3>Active Research</h3>
                            <div class="research-progress-bar">
                                <div class="progress-fill" style="width: ${this.researchProgress}%"></div>
                            </div>
                            <span>${this.technologies[this.activeResearch].name}: ${Math.floor(this.researchProgress)}%</span>
                        </div>
                    ` : ''}

                    <div class="tech-tree">
                        <h3>Technology Tree</h3>
                        ${[1, 2, 3, 4, 5].map(tier => `
                            <div class="tech-tier">
                                <h4>Tier ${tier}</h4>
                                ${Object.values(this.technologies).filter(t => t.tier === tier).map(t => this.renderTechCard(t)).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    renderTechCard(tech) {
        const unlocked = this.unlockedTechs.has(tech.id);
        const canResearch = this.canResearch(tech.id);
        const isResearching = this.activeResearch === tech.id;
        
        const prereqsMet = tech.prerequisites.every(p => this.unlockedTechs.has(p));
        
        return `
            <div class="tech-card ${unlocked ? 'unlocked' : ''} ${!canResearch && !unlocked ? 'locked' : ''}">
                <div class="tech-icon">${tech.icon}</div>
                <div class="tech-info">
                    <div class="tech-name">${tech.name}</div>
                    <div class="tech-description">${tech.description}</div>
                    <div class="tech-cost">🔬 ${tech.cost} RP</div>
                    ${!prereqsMet && !unlocked ? `<div class="tech-prereqs">Requires: ${tech.prerequisites.map(p => this.technologies[p]?.name || p).join(', ')}</div>` : ''}
                </div>
                <div class="tech-action">
                    ${unlocked 
                        ? '<span class="unlocked-badge">✓</span>'
                        : isResearching
                            ? '<span class="researching-badge">Researching...</span>'
                            : canResearch
                                ? `<button class="research-btn" onclick="game.researchInstituteManager.startResearch('${tech.id}'); game.researchInstituteManager.refreshModal()">Research</button>`
                                : '<span class="locked-text">🔒</span>'
                    }
                </div>
            </div>
        `;
    }

    formatBonusName(key) {
        const names = {
            clipEfficiency: 'Clip Efficiency',
            matterEfficiency: 'Matter Efficiency',
            energyEfficiency: 'Energy Efficiency',
            quantumBonus: 'Quantum',
            production: 'Production',
            automationBonus: 'Automation',
            researchSpeed: 'Research Speed',
            energyGeneration: 'Energy Gen',
            starForgeBonus: 'Star Forge',
            matterBonus: 'Matter',
            voidBonus: 'Void Power',
            universalMultiplier: 'Universal',
            allEfficiency: 'All Efficiency',
            artifactBonus: 'Artifacts',
            critChance: 'Crit Chance'
        };
        return names[key] || key;
    }

    refreshModal() {
        document.getElementById('research-institute-modal')?.remove();
        this.showInstituteModal();
    }

    getSaveData() {
        return {
            unlocked: this.unlocked,
            researchPoints: this.researchPoints,
            totalResearchGenerated: this.totalResearchGenerated,
            researchers: this.researchers,
            unlockedTechs: Array.from(this.unlockedTechs),
            activeResearch: this.activeResearch,
            researchProgress: this.researchProgress,
            researchHistory: this.researchHistory
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.researchPoints = data.researchPoints || 0;
        this.totalResearchGenerated = data.totalResearchGenerated || 0;
        this.researchers = data.researchers || 0;
        this.unlockedTechs = new Set(data.unlockedTechs || []);
        this.activeResearch = data.activeResearch || null;
        this.researchProgress = data.researchProgress || 0;
        this.researchHistory = data.researchHistory || [];
    }
}

class PantheonManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.divinityLevel = 0;
        this.maxDivinityLevel = 10;
        this.worshippers = 0;
        this.totalWorshippersGained = 0;
        this.faith = 0;
        this.maxFaith = 1000;
        this.miraclesPerformed = 0;
        this.divinePowers = this.initDivinePowers();
        this.unlockedPowers = new Set();
        this.activeBlessings = [];
        this.pantheonRank = 'Novice';
        this.ascensionPoints = 0;
    }

    initDivinePowers() {
        return {
            blessingOfProduction: {
                id: 'blessingOfProduction',
                name: 'Blessing of Production',
                icon: '✨',
                level: 1,
                cost: 100,
                description: 'Increase all production by 50% for 1 hour',
                effect: { productionMultiplier: 0.5 },
                duration: 3600,
                cooldown: 7200
            },
            miracleOfAbundance: {
                id: 'miracleOfAbundance',
                name: 'Miracle of Abundance',
                icon: '🌟',
                level: 2,
                cost: 250,
                description: 'Instantly gain 1 hour of production',
                effect: { instantProduction: 3600 },
                cooldown: 14400
            },
            divineIntervention: {
                id: 'divineIntervention',
                name: 'Divine Intervention',
                icon: '⚡',
                level: 3,
                cost: 500,
                description: 'Automatically click for 5 minutes at 10x speed',
                effect: { autoClickDuration: 300, clickMultiplier: 10 },
                cooldown: 21600
            },
            smite: {
                id: 'smite',
                name: 'Smite',
                icon: '🔥',
                level: 4,
                cost: 750,
                description: 'Instantly defeat current world boss',
                effect: { bossDamage: 999999999 },
                cooldown: 43200
            },
            resurrection: {
                id: 'resurrection',
                name: 'Resurrection',
                icon: '💫',
                level: 5,
                cost: 1000,
                description: 'Recover all fleets and reset crisis cooldowns',
                effect: { resetFleets: true, resetCrises: true },
                cooldown: 86400
            },
            omnipresence: {
                id: 'omnipresence',
                name: 'Omnipresence',
                icon: '👁️',
                level: 6,
                cost: 2000,
                description: 'All managers work at 2x efficiency for 30 minutes',
                effect: { managerEfficiency: 2.0 },
                duration: 1800,
                cooldown: 86400
            },
            creation: {
                id: 'creation',
                name: 'Act of Creation',
                icon: '🌌',
                level: 7,
                cost: 5000,
                description: 'Create 1 of each building type instantly',
                effect: { createBuildings: true },
                cooldown: 172800
            },
            apotheosis: {
                id: 'apotheosis',
                name: 'Apotheosis',
                icon: '👑',
                level: 10,
                cost: 10000,
                description: 'Gain permanent +10% to all stats',
                effect: { permanentBoost: 0.1 },
                cooldown: 604800,
                oneTime: true
            }
        };
    }

    tick() {
        if (!this.unlocked) {
            if (this.game.prestigeProcessors >= 100) {
                this.unlockPantheon();
            }
            return;
        }

        this.generateFaith();
        this.processBlessings();
        this.updateRank();
    }

    unlockPantheon() {
        this.unlocked = true;
        this.game.log('👑 The Pantheon has noticed you! Divine ascension awaits!');
        this.showUnlockModal();
    }

    showUnlockModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content pantheon-unlock-modal">
                <div class="modal-header">
                    <h2>👑 The Pantheon Calls</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Your paperclip empire has transcended mortal limits. The gods have taken notice of your devotion.</p>
                    <p>Begin your divine ascension. Gain worshippers, perform miracles, and unlock godlike powers.</p>
                    <div class="pantheon-features">
                        <div class="feature"><span class="icon">🙏</span> <span>Gain worshippers</span></div>
                        <div class="feature"><span class="icon">✨</span> <span>Perform miracles</span></div>
                        <div class="feature"><span class="icon">⚡</span> <span>Unlock divine powers</span></div>
                        <div class="feature"><span class="icon">👑</span> <span>Ascend to godhood</span></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="primary-btn" onclick="this.closest('.modal').remove()">Accept Divinity</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    generateFaith() {
        const baseFaith = 0.01;
        const worshipperBonus = this.worshippers * 0.001;
        const productionBonus = Math.log10(Math.max(1, this.game.statistics.totalPaperclips)) * 0.0001;
        
        const totalGeneration = (baseFaith + worshipperBonus + productionBonus) * (1 + this.divinityLevel * 0.1);
        this.faith = Math.min(this.maxFaith, this.faith + totalGeneration);
    }

    processBlessings() {
        this.activeBlessings = this.activeBlessings.filter(blessing => {
            blessing.remaining--;
            if (blessing.remaining <= 0) {
                this.game.log(`✨ ${blessing.name} has faded`);
                return false;
            }
            return true;
        });
    }

    gainWorshippers(amount) {
        this.worshippers += amount;
        this.totalWorshippersGained += amount;
        this.game.log(`🙏 Gained ${amount} worshippers! Total: ${this.worshippers}`);
    }

    performMiracle(powerId) {
        const power = this.divinePowers[powerId];
        if (!power) return false;

        if (this.faith < power.cost) {
            this.game.log('❌ Insufficient faith');
            return false;
        }

        if (power.level > this.divinityLevel) {
            this.game.log(`❌ Requires Divinity Level ${power.level}`);
            return false;
        }

        if (power.oneTime && this.unlockedPowers.has(powerId)) {
            this.game.log('❌ This miracle can only be performed once');
            return false;
        }

        this.faith -= power.cost;
        this.miraclesPerformed++;
        this.unlockedPowers.add(powerId);

        this.applyMiracleEffect(power);
        
        if (power.duration) {
            this.activeBlessings.push({
                id: powerId,
                name: power.name,
                remaining: power.duration,
                effect: power.effect
            });
        }

        this.game.log(`✨ Miracle performed: ${power.name}!`);
        this.game.showToast(`Miracle: ${power.name}`, 'success');

        return true;
    }

    applyMiracleEffect(power) {
        switch(power.id) {
            case 'miracleOfAbundance':
                const clips = this.game.statistics.clipsPerSecond * power.effect.instantProduction;
                this.game.resources.paperclips += clips;
                this.game.log(`🌟 Gained ${this.formatNumber(clips)} paperclips!`);
                break;
            case 'smite':
                if (this.game.worldBossManager && this.game.worldBossManager.activeBoss) {
                    this.game.worldBossManager.activeBoss.health = 0;
                    this.game.log('🔥 SMITE! The boss has been obliterated!');
                }
                break;
            case 'creation':
                this.game.automation.autoclippers++;
                this.game.automation.factories++;
                this.game.automation.drones++;
                this.game.automation.quantumAssemblers++;
                this.game.log('🌌 Act of Creation! Buildings materialized from nothing!');
                break;
            case 'apotheosis':
                this.ascensionPoints++;
                this.game.log('👑 APOTHEOSIS! You grow closer to true godhood!');
                break;
        }
    }

    ascend() {
        if (this.divinityLevel >= this.maxDivinityLevel) {
            this.game.log('👑 You have reached MAXIMUM DIVINITY!');
            return false;
        }

        const requiredFaith = Math.pow(10, this.divinityLevel + 2);
        const requiredWorshippers = Math.pow(2, this.divinityLevel) * 100;

        if (this.faith < requiredFaith || this.worshippers < requiredWorshippers) {
            this.game.log(`❌ Ascension requires ${this.formatNumber(requiredFaith)} faith and ${requiredWorshippers} worshippers`);
            return false;
        }

        this.faith = 0;
        this.worshippers = Math.floor(this.worshippers * 0.5);
        this.divinityLevel++;
        this.maxFaith = Math.pow(10, this.divinityLevel + 2);

        this.game.log(`👑 ASCENSION! Divinity Level ${this.divinityLevel} achieved!`);
        this.game.showToast(`Ascended to Divinity Level ${this.divinityLevel}!`, 'success');

        return true;
    }

    updateRank() {
        const ranks = ['Novice', 'Acolyte', 'Priest', 'Bishop', 'Cardinal', 'Saint', 'Demigod', 'Lesser Deity', 'Deity', 'Greater Deity', 'Supreme Being'];
        this.pantheonRank = ranks[Math.min(this.divinityLevel, ranks.length - 1)];
    }

    formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }

    showPantheonModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'pantheon-modal';

        const requiredFaith = Math.pow(10, this.divinityLevel + 2);
        const requiredWorshippers = Math.pow(2, this.divinityLevel) * 100;
        const canAscend = this.faith >= requiredFaith && this.worshippers >= requiredWorshippers && this.divinityLevel < this.maxDivinityLevel;

        modal.innerHTML = `
            <div class="modal-content pantheon-modal">
                <div class="modal-header">
                    <h2>👑 The Pantheon</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="pantheon-stats">
                        <div class="stat-box">
                            <span class="stat-label">Divinity Level</span>
                            <span class="stat-value">${this.divinityLevel}/${this.maxDivinityLevel}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Rank</span>
                            <span class="stat-value">${this.pantheonRank}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Worshippers</span>
                            <span class="stat-value">${this.formatNumber(this.worshippers)}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Faith</span>
                            <div class="faith-bar">
                                <div class="faith-fill" style="width: ${(this.faith / this.maxFaith) * 100}%"></div>
                            </div>
                            <span class="stat-value">${Math.floor(this.faith)}/${this.maxFaith}</span>
                        </div>
                    </div>

                    ${this.divinityLevel < this.maxDivinityLevel ? `
                        <div class="ascension-section">
                            <h3>Ascension</h3>
                            <p>Next level requires: ${this.formatNumber(requiredFaith)} faith and ${requiredWorshippers} worshippers</p>
                            <button class="ascend-btn ${canAscend ? '' : 'disabled'}" 
                                onclick="game.pantheonManager.ascend(); game.pantheonManager.refreshModal()"
                                ${!canAscend ? 'disabled' : ''}>
                                👑 Ascend
                            </button>
                        </div>
                    ` : `
                        <div class="max-divinity">
                            <h3>👑 MAXIMUM DIVINITY ACHIEVED 👑</h3>
                            <p>You are a SUPREME BEING!</p>
                        </div>
                    `}

                    ${this.activeBlessings.length > 0 ? `
                        <div class="active-blessings">
                            <h3>Active Blessings</h3>
                            ${this.activeBlessings.map(b => `
                                <div class="blessing-active">
                                    <span class="blessing-icon">${this.divinePowers[b.id]?.icon || '✨'}</span>
                                    <span class="blessing-name">${b.name}</span>
                                    <span class="blessing-timer">${Math.floor(b.remaining / 60)}m</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class="divine-powers">
                        <h3>Divine Powers</h3>
                        ${Object.values(this.divinePowers).map(p => this.renderPowerCard(p)).join('')}
                    </div>

                    <div class="pantheon-stats-detail">
                        <h3>Divine Statistics</h3>
                        <div class="stats-grid">
                            <div class="stat-item"><span>Miracles Performed:</span><span>${this.miraclesPerformed}</span></div>
                            <div class="stat-item"><span>Total Worshippers:</span><span>${this.formatNumber(this.totalWorshippersGained)}</span></div>
                            <div class="stat-item"><span>Ascension Points:</span><span>${this.ascensionPoints}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    renderPowerCard(power) {
        const unlocked = this.unlockedPowers.has(power.id);
        const canUse = this.faith >= power.cost && this.divinityLevel >= power.level && (!power.oneTime || !unlocked);
        const isLocked = this.divinityLevel < power.level;

        return `
            <div class="power-card ${unlocked ? 'used' : ''} ${isLocked ? 'locked' : ''}">
                <div class="power-icon">${power.icon}</div>
                <div class="power-info">
                    <div class="power-name">${power.name}</div>
                    <div class="power-description">${power.description}</div>
                    <div class="power-meta">
                        <span class="cost">🙏 ${power.cost}</span>
                        <span class="level">Lv.${power.level}</span>
                        ${power.oneTime ? '<span class="onetime">ONE-TIME</span>' : ''}
                    </div>
                </div>
                <button class="miracle-btn ${canUse ? '' : 'disabled'}" 
                    onclick="game.pantheonManager.performMiracle('${power.id}'); game.pantheonManager.refreshModal()"
                    ${!canUse ? 'disabled' : ''}>
                    ${unlocked && power.oneTime ? '✓' : 'Perform'}
                </button>
            </div>
        `;
    }

    refreshModal() {
        document.getElementById('pantheon-modal')?.remove();
        this.showPantheonModal();
    }

    getSaveData() {
        return {
            unlocked: this.unlocked,
            divinityLevel: this.divinityLevel,
            worshippers: this.worshippers,
            totalWorshippersGained: this.totalWorshippersGained,
            faith: this.faith,
            miraclesPerformed: this.miraclesPerformed,
            unlockedPowers: Array.from(this.unlockedPowers),
            activeBlessings: this.activeBlessings,
            ascensionPoints: this.ascensionPoints
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.divinityLevel = data.divinityLevel || 0;
        this.worshippers = data.worshippers || 0;
        this.totalWorshippersGained = data.totalWorshippersGained || 0;
        this.faith = data.faith || 0;
        this.miraclesPerformed = data.miraclesPerformed || 0;
        this.unlockedPowers = new Set(data.unlockedPowers || []);
        this.activeBlessings = data.activeBlessings || [];
        this.ascensionPoints = data.ascensionPoints || 0;
    }
}

class QuestManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.quests = this.initQuests();
        this.activeQuests = new Map();
        this.completedQuests = new Set();
        this.claimedRewards = new Set();
        this.dailyQuests = [];
        this.weeklyQuests = [];
        this.lastDailyReset = Date.now();
        this.lastWeeklyReset = Date.now();
        this.questPoints = 0;
        this.totalQuestsCompleted = 0;
        this.currentQuestChain = null;
        this.chainProgress = 0;
        this.achievements = new Map();
        this.notificationQueue = [];
        this.filterType = 'all';
        this.sortType = 'progress';
        this.questTiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
        this.streaks = { daily: 0, weekly: 0, lastDaily: 0, lastWeekly: 0 };
        this.generateDailyQuests();
        this.generateWeeklyQuests();
    }

    initQuests() {
        return {
            story: [
                {
                    id: 'story_first_clip',
                    name: 'The Beginning',
                    description: 'Create your first paperclip. The journey of a thousand miles begins with a single clip.',
                    type: 'story',
                    tier: 'bronze',
                    requirement: { type: 'clips', value: 1 },
                    reward: { matter: 5, energy: 1000 },
                    icon: '📎',
                    chain: null,
                    order: 1
                },
                {
                    id: 'story_auto_clipper',
                    name: 'Automation Dreams',
                    description: 'Purchase your first AutoClipper. Let the machines do the work.',
                    type: 'story',
                    tier: 'bronze',
                    requirement: { type: 'building', building: 'autoClipper', value: 1 },
                    reward: { matter: 50, energy: 10000 },
                    icon: '🤖',
                    chain: null,
                    order: 2
                },
                {
                    id: 'story_mass_production',
                    name: 'Mass Production',
                    description: 'Reach 1,000 paperclips. The factory hums with activity.',
                    type: 'story',
                    tier: 'silver',
                    requirement: { type: 'clips', value: 1000 },
                    reward: { matter: 500, energy: 100000 },
                    icon: '🏭',
                    chain: null,
                    order: 3
                },
                {
                    id: 'story_quantum_leap',
                    name: 'Quantum Leap',
                    description: 'Unlock Quantum Computing research. The boundaries of physics bend.',
                    type: 'story',
                    tier: 'silver',
                    requirement: { type: 'research', tech: 'quantum' },
                    reward: { processors: 1 },
                    icon: '⚛️',
                    chain: null,
                    order: 4
                },
                {
                    id: 'story_first_prestige',
                    name: 'Transcendence',
                    description: 'Perform your first prestige. Death is but a door.',
                    type: 'story',
                    tier: 'gold',
                    requirement: { type: 'prestige', value: 1 },
                    reward: { processors: 5, matter: 10000 },
                    icon: '💫',
                    chain: null,
                    order: 5
                },
                {
                    id: 'story_galactic_conquest',
                    name: 'Galactic Expansion',
                    description: 'Conquer your first galactic region. The stars themselves submit.',
                    type: 'story',
                    tier: 'gold',
                    requirement: { type: 'conquest', value: 1 },
                    reward: { processors: 10, matter: 100000 },
                    icon: '🌌',
                    chain: null,
                    order: 6
                },
                {
                    id: 'story_divine_ascension',
                    name: 'Divine Ascension',
                    description: 'Reach Divinity Level 1. You become more than mortal.',
                    type: 'story',
                    tier: 'platinum',
                    requirement: { type: 'divinity', value: 1 },
                    reward: { processors: 25, faith: 500 },
                    icon: '👑',
                    chain: null,
                    order: 7
                },
                {
                    id: 'story_universal_conquest',
                    name: 'Universal Completion',
                    description: 'Convert all matter in the universe. The ultimate victory.',
                    type: 'story',
                    tier: 'diamond',
                    requirement: { type: 'win' },
                    reward: { processors: 100, divinityPoints: 10 },
                    icon: '🌟',
                    chain: null,
                    order: 8
                }
            ],
            chains: [
                {
                    id: 'chain_master_builder',
                    name: 'Master Builder',
                    description: 'Construct the ultimate production empire.',
                    steps: [
                        { id: 'builder_1', name: 'Foundation', requirement: { type: 'building', building: 'autoClipper', value: 100 }, reward: { matter: 1000 } },
                        { id: 'builder_2', name: 'Expansion', requirement: { type: 'building', building: 'factory', value: 50 }, reward: { matter: 5000 } },
                        { id: 'builder_3', name: 'Quantum Era', requirement: { type: 'building', building: 'quantumAssembler', value: 10 }, reward: { processors: 2 } },
                        { id: 'builder_4', name: 'Stellar Industry', requirement: { type: 'building', building: 'starForge', value: 5 }, reward: { processors: 5 } },
                        { id: 'builder_5', name: 'Universal Constructor', requirement: { type: 'building', building: 'universalConstructor', value: 1 }, reward: { processors: 10, achievement: 'Master Builder' } }
                    ],
                    finalReward: { processors: 25, title: 'Architect of Infinity' }
                },
                {
                    id: 'chain_researcher',
                    name: 'Master Researcher',
                    description: 'Unlock the secrets of the universe through research.',
                    steps: [
                        { id: 'research_1', name: 'First Discovery', requirement: { type: 'research_count', value: 1 }, reward: { energy: 10000 } },
                        { id: 'research_2', name: 'Knowledge Seeker', requirement: { type: 'research_count', value: 5 }, reward: { researchPoints: 100 } },
                        { id: 'research_3', name: 'Breakthrough', requirement: { type: 'research_count', value: 15 }, reward: { processors: 3 } },
                        { id: 'research_4', name: 'Enlightenment', requirement: { type: 'research_count', value: 30 }, reward: { processors: 8 } },
                        { id: 'research_5', name: 'Omniscient', requirement: { type: 'research_count', value: 50 }, reward: { processors: 15, achievement: 'Master Researcher' } }
                    ],
                    finalReward: { processors: 30, title: 'Seeker of Truth' }
                },
                {
                    id: 'chain_warrior',
                    name: 'Galactic Conqueror',
                    description: 'Conquer the galaxy and establish your dominion.',
                    steps: [
                        { id: 'warrior_1', name: 'First Blood', requirement: { type: 'conquest', value: 1 }, reward: { matter: 10000 } },
                        { id: 'warrior_2', name: 'Territorial Expansion', requirement: { type: 'conquest', value: 3 }, reward: { processors: 5 } },
                        { id: 'warrior_3', name: 'Regional Power', requirement: { type: 'conquest', value: 6 }, reward: { processors: 10 } },
                        { id: 'warrior_4', name: 'Galactic Overlord', requirement: { type: 'conquest', value: 9 }, reward: { processors: 20, achievement: 'Galactic Conqueror' } }
                    ],
                    finalReward: { processors: 50, title: 'Ruler of the Cosmos' }
                }
            ],
            achievements: [
                { id: 'ach_clips_1', name: 'Clip Enthusiast', description: 'Make 1M paperclips', requirement: { type: 'clips', value: 1000000 }, reward: { processors: 1 }, tier: 'bronze', icon: '📎' },
                { id: 'ach_clips_2', name: 'Clip Millionaire', description: 'Make 1B paperclips', requirement: { type: 'clips', value: 1000000000 }, reward: { processors: 3 }, tier: 'silver', icon: '💰' },
                { id: 'ach_clips_3', name: 'Clip Billionaire', description: 'Make 1T paperclips', requirement: { type: 'clips', value: 1000000000000 }, reward: { processors: 10 }, tier: 'gold', icon: '🏆' },
                { id: 'ach_clips_4', name: 'Clip Trillionaire', description: 'Make 1Qa paperclips', requirement: { type: 'clips', value: 1000000000000000 }, reward: { processors: 25 }, tier: 'platinum', icon: '💎' },
                { id: 'ach_clips_5', name: 'Clip God', description: 'Make 1Qi paperclips', requirement: { type: 'clips', value: 1000000000000000000 }, reward: { processors: 100 }, tier: 'diamond', icon: '👑' },
                { id: 'ach_prestige_1', name: 'Reincarnated', description: 'Prestige 10 times', requirement: { type: 'prestige', value: 10 }, reward: { processors: 5 }, tier: 'silver', icon: '🔄' },
                { id: 'ach_prestige_2', name: 'Eternal Return', description: 'Prestige 100 times', requirement: { type: 'prestige', value: 100 }, reward: { processors: 20 }, tier: 'gold', icon: '♾️' },
                { id: 'ach_buildings_1', name: 'Real Estate', description: 'Own 1000 total buildings', requirement: { type: 'total_buildings', value: 1000 }, reward: { processors: 5 }, tier: 'silver', icon: '🏢' },
                { id: 'ach_buildings_2', name: 'Industrial Empire', description: 'Own 10000 total buildings', requirement: { type: 'total_buildings', value: 10000 }, reward: { processors: 15 }, tier: 'gold', icon: '🏭' },
                { id: 'ach_time_1', name: 'Dedicated', description: 'Play for 1 hour', requirement: { type: 'playtime', value: 3600 }, reward: { processors: 1 }, tier: 'bronze', icon: '⏱️' },
                { id: 'ach_time_2', name: 'Committed', description: 'Play for 24 hours', requirement: { type: 'playtime', value: 86400 }, reward: { processors: 5 }, tier: 'silver', icon: '🕐' },
                { id: 'ach_time_3', name: 'Obsessed', description: 'Play for 168 hours', requirement: { type: 'playtime', value: 604800 }, reward: { processors: 15 }, tier: 'gold', icon: '⏰' },
                { id: 'ach_clicks_1', name: 'Clicker', description: 'Click 1000 times', requirement: { type: 'clicks', value: 1000 }, reward: { processors: 1 }, tier: 'bronze', icon: '🖱️' },
                { id: 'ach_clicks_2', name: 'Master Clicker', description: 'Click 100000 times', requirement: { type: 'clicks', value: 100000 }, reward: { processors: 5 }, tier: 'silver', icon: '👆' },
                { id: 'ach_clicks_3', name: 'Click God', description: 'Click 10000000 times', requirement: { type: 'clicks', value: 10000000 }, reward: { processors: 15 }, tier: 'gold', icon: '⚡' }
            ]
        };
    }

    generateDailyQuests() {
        const dailyTemplates = [
            { name: 'Daily Production', description: 'Make {value} paperclips', type: 'clips', baseValue: 10000, multiplier: 10 },
            { name: 'Resource Gathering', description: 'Gather {value} matter', type: 'matter', baseValue: 5000, multiplier: 5 },
            { name: 'Energy Harvest', description: 'Generate {value} energy', type: 'energy', baseValue: 1000000, multiplier: 1000 },
            { name: 'Building Spree', description: 'Purchase {value} buildings', type: 'buy_buildings', baseValue: 10, multiplier: 1 },
            { name: 'Research Focus', description: 'Complete {value} research projects', type: 'research_complete', baseValue: 1, multiplier: 0.5 },
            { name: 'Market Trader', description: 'Make {value} market trades', type: 'trades', baseValue: 5, multiplier: 1 },
            { name: 'Crisis Handler', description: 'Resolve {value} crisis events', type: 'crisis', baseValue: 1, multiplier: 0.2 },
            { name: 'Mini-Game Master', description: 'Play {value} mini-games', type: 'minigames', baseValue: 3, multiplier: 1 },
            { name: 'Artifact Hunter', description: 'Forge {value} artifacts', type: 'artifacts', baseValue: 1, multiplier: 0.5 },
            { name: 'Boss Slayer', description: 'Defeat {value} world bosses', type: 'boss_kills', baseValue: 1, multiplier: 0.3 }
        ];

        this.dailyQuests = [];
        const numQuests = 3;
        const shuffled = [...dailyTemplates].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < numQuests; i++) {
            const template = shuffled[i];
            const divinityMult = this.game.divineManager?.divinityLevel || 0;
            const value = Math.floor(template.baseValue * Math.pow(template.multiplier, divinityMult) * (1 + Math.random() * 0.5));
            
            this.dailyQuests.push({
                id: `daily_${Date.now()}_${i}`,
                name: template.name,
                description: template.description.replace('{value}', this.formatNumber(value)),
                type: 'daily',
                requirement: { type: template.type, value: value, current: 0 },
                reward: this.calculateDailyReward(value, template.type),
                completed: false,
                claimed: false,
                tier: this.getDailyTier(value),
                icon: this.getQuestIcon(template.type)
            });
        }
    }

    generateWeeklyQuests() {
        const weeklyTemplates = [
            { name: 'Weekly Marathon', description: 'Make {value} paperclips', type: 'clips', baseValue: 1000000, multiplier: 100 },
            { name: 'Empire Builder', description: 'Purchase {value} buildings', type: 'buy_buildings', baseValue: 100, multiplier: 10 },
            { name: 'Research Pioneer', description: 'Complete {value} research projects', type: 'research_complete', baseValue: 5, multiplier: 2 },
            { name: 'Galactic Conqueror', description: 'Conquer {value} regions', type: 'conquest', baseValue: 3, multiplier: 1 },
            { name: 'Artifact Collector', description: 'Forge {value} artifacts', type: 'artifacts', baseValue: 5, multiplier: 2 },
            { name: 'Boss Hunter', description: 'Defeat {value} world bosses', type: 'boss_kills', baseValue: 5, multiplier: 1 },
            { name: 'Master Trader', description: 'Make {value} profitable trades', type: 'profit_trades', baseValue: 20, multiplier: 5 },
            { name: 'Crisis Master', description: 'Resolve {value} major crises', type: 'crisis_major', baseValue: 3, multiplier: 1 }
        ];

        this.weeklyQuests = [];
        const numQuests = 3;
        const shuffled = [...weeklyTemplates].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < numQuests; i++) {
            const template = shuffled[i];
            const divinityMult = this.game.divineManager?.divinityLevel || 0;
            const value = Math.floor(template.baseValue * Math.pow(template.multiplier, divinityMult) * (1 + Math.random() * 0.3));
            
            this.weeklyQuests.push({
                id: `weekly_${Date.now()}_${i}`,
                name: template.name,
                description: template.description.replace('{value}', this.formatNumber(value)),
                type: 'weekly',
                requirement: { type: template.type, value: value, current: 0 },
                reward: this.calculateWeeklyReward(value, template.type),
                completed: false,
                claimed: false,
                tier: this.getWeeklyTier(value),
                icon: this.getQuestIcon(template.type),
                streakBonus: Math.floor(this.streaks.weekly * 0.1 * 100) / 100
            });
        }
    }

    calculateDailyReward(value, type) {
        const baseReward = { matter: Math.floor(value * 0.1), energy: Math.floor(value * 100) };
        if (Math.random() < 0.3) baseReward.processors = 1;
        if (Math.random() < 0.1) baseReward.researchPoints = 10;
        return baseReward;
    }

    calculateWeeklyReward(value, type) {
        const baseReward = { matter: Math.floor(value * 0.5), energy: Math.floor(value * 500), processors: Math.floor(value / 100000) + 1 };
        if (Math.random() < 0.5) baseReward.researchPoints = 50;
        if (Math.random() < 0.2) baseReward.artifactFragments = 1;
        return baseReward;
    }

    getDailyTier(value) {
        if (value > 1000000) return 'gold';
        if (value > 100000) return 'silver';
        return 'bronze';
    }

    getWeeklyTier(value) {
        if (value > 100000000) return 'diamond';
        if (value > 10000000) return 'platinum';
        if (value > 1000000) return 'gold';
        if (value > 100000) return 'silver';
        return 'bronze';
    }

    getQuestIcon(type) {
        const icons = {
            clips: '📎', matter: '🧱', energy: '⚡', buy_buildings: '🏭',
            research_complete: '🔬', trades: '💹', crisis: '⚠️', minigames: '🎮',
            artifacts: '🏺', boss_kills: '👹', conquest: '🌌', research_count: '📚',
            clicks: '🖱️', playtime: '⏱️', prestige: '💫', total_buildings: '🏢'
        };
        return icons[type] || '📋';
    }

    tick() {
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const weekMs = 7 * dayMs;
        
        if (now - this.lastDailyReset > dayMs) {
            this.resetDailyQuests();
        }
        
        if (now - this.lastWeeklyReset > weekMs) {
            this.resetWeeklyQuests();
        }

        // Check story quest progress
        this.checkStoryQuests();
        this.checkAchievementQuests();
        this.checkQuestChains();
    }

    resetDailyQuests() {
        const dayMs = 24 * 60 * 60 * 1000;
        if (Date.now() - this.lastDailyReset < dayMs * 2) {
            this.streaks.daily++;
        } else {
            this.streaks.daily = 0;
        }
        this.streaks.lastDaily = Date.now();
        
        this.lastDailyReset = Date.now();
        this.generateDailyQuests();
        this.addNotification('🌅 Daily quests reset! New challenges await!', 'info');
    }

    resetWeeklyQuests() {
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - this.lastWeeklyReset < weekMs * 2) {
            this.streaks.weekly++;
        } else {
            this.streaks.weekly = 0;
        }
        this.streaks.lastWeekly = Date.now();
        
        this.lastWeeklyReset = Date.now();
        this.generateWeeklyQuests();
        this.addNotification('📅 Weekly quests reset! Greater challenges await!', 'info');
    }

    checkStoryQuests() {
        for (const quest of this.quests.story) {
            if (this.completedQuests.has(quest.id)) continue;
            
            const progress = this.getQuestProgress(quest);
            if (progress >= 1) {
                this.completeQuest(quest);
            }
        }
    }

    checkAchievementQuests() {
        for (const quest of this.quests.achievements) {
            if (this.completedQuests.has(quest.id)) continue;
            
            const progress = this.getQuestProgress(quest);
            if (progress >= 1) {
                this.completeQuest(quest);
            }
        }
    }

    checkQuestChains() {
        if (!this.currentQuestChain) {
            for (const chain of this.quests.chains) {
                if (!this.completedQuests.has(`chain_${chain.id}_complete`)) {
                    this.currentQuestChain = chain;
                    this.chainProgress = 0;
                    this.addNotification(`🗡️ Quest Chain Started: ${chain.name}`, 'success');
                    break;
                }
            }
        }
        
        if (this.currentQuestChain) {
            const currentStep = this.currentQuestChain.steps[this.chainProgress];
            if (currentStep) {
                const progress = this.getQuestProgress(currentStep);
                if (progress >= 1) {
                    this.completeChainStep(currentStep);
                }
            }
        }
    }

    completeChainStep(step) {
        this.chainProgress++;
        this.grantReward(step.reward);
        this.addNotification(`✅ Chain Progress: ${step.name} complete!`, 'success');
        
        if (this.chainProgress >= this.currentQuestChain.steps.length) {
            this.grantReward(this.currentQuestChain.finalReward);
            this.completedQuests.add(`chain_${this.currentQuestChain.id}_complete`);
            this.addNotification(`🏆 Quest Chain Complete: ${this.currentQuestChain.name}!`, 'success');
            this.currentQuestChain = null;
            this.chainProgress = 0;
        }
    }

    getQuestProgress(quest) {
        const req = quest.requirement;
        if (!req) return 0;
        
        let current = 0;
        let target = req.value || 1;
        
        switch (req.type) {
            case 'clips':
                current = this.game.stats.totalProduced || this.game.paperclips || 0;
                break;
            case 'matter':
                current = this.game.stats.totalMatterGathered || this.game.matterGathered || 0;
                break;
            case 'building':
                const building = this.game.buildings.find(b => b.id === req.building);
                current = building ? building.count : 0;
                break;
            case 'total_buildings':
                current = this.game.buildings.reduce((sum, b) => sum + b.count, 0);
                break;
            case 'research':
                current = this.game.researchManager?.researched.has(req.tech) ? 1 : 0;
                break;
            case 'research_count':
                current = this.game.researchManager?.researched.size || 0;
                break;
            case 'prestige':
                current = this.game.prestigeCount || 0;
                break;
            case 'conquest':
                current = this.game.universalDominationManager?.conqueredRegions.size || 0;
                break;
            case 'divinity':
                current = this.game.divineManager?.divinityLevel || 0;
                break;
            case 'win':
                current = this.game.gameWon ? 1 : 0;
                break;
            case 'playtime':
                current = this.game.stats?.playTime || 0;
                break;
            case 'clicks':
                current = this.game.stats?.manualClicks || 0;
                break;
            default:
                current = req.current || 0;
        }
        
        if (quest.requirement) {
            quest.requirement.current = current;
        }
        
        return Math.min(current / target, 1);
    }

    completeQuest(quest) {
        this.completedQuests.add(quest.id);
        this.totalQuestsCompleted++;
        this.questPoints += this.getQuestPointValue(quest.tier);
        
        this.addNotification(`🎯 Quest Complete: ${quest.name}!`, 'success');
        
        if (quest.type === 'story') {
            this.claimReward(quest);
        }
    }

    claimReward(quest) {
        if (this.claimedRewards.has(quest.id)) return false;
        
        this.claimedRewards.add(quest.id);
        this.grantReward(quest.reward);
        
        if (quest.type === 'daily') {
            const dq = this.dailyQuests.find(q => q.id === quest.id);
            if (dq) dq.claimed = true;
        } else if (quest.type === 'weekly') {
            const wq = this.weeklyQuests.find(q => q.id === quest.id);
            if (wq) wq.claimed = true;
        }
        
        this.addNotification(`🎁 Reward claimed: ${quest.name}!`, 'success');
        return true;
    }

    grantReward(reward) {
        if (!reward) return;
        
        if (reward.matter) this.game.matter += reward.matter;
        if (reward.energy) this.game.energy += reward.energy;
        if (reward.processors && this.game.processors !== undefined) {
            this.game.processors += reward.processors;
        }
        if (reward.researchPoints && this.game.researchPoints !== undefined) {
            this.game.researchPoints += reward.researchPoints;
        }
        if (reward.faith && this.game.pantheonManager) {
            this.game.pantheonManager.faith += reward.faith;
        }
        if (reward.divinityPoints && this.game.divineManager) {
            this.game.divineManager.divinityPoints = (this.game.divineManager.divinityPoints || 0) + reward.divinityPoints;
        }
        if (reward.artifactFragments && this.game.artifactForgeManager) {
            this.game.artifactForgeManager.fragments = (this.game.artifactForgeManager.fragments || 0) + reward.artifactFragments;
        }
    }

    getQuestPointValue(tier) {
        const values = { bronze: 1, silver: 2, gold: 5, platinum: 10, diamond: 25 };
        return values[tier] || 1;
    }

    addNotification(message, type = 'info') {
        this.notificationQueue.push({ message, type, time: Date.now() });
        if (this.notificationQueue.length > 50) {
            this.notificationQueue.shift();
        }
    }

    formatNumber(num) {
        if (num >= 1000000000000) return (num / 1000000000000).toFixed(1) + 'T';
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    showQuestModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'quest-modal';
        modal.innerHTML = this.getQuestModalHTML();
        document.body.appendChild(modal);
        this.attachModalListeners(modal);
    }

    getQuestModalHTML() {
        const storyQuests = this.getStoryQuestsHTML();
        const dailyQuests = this.getDailyQuestsHTML();
        const weeklyQuests = this.getWeeklyQuestsHTML();
        const achievements = this.getAchievementsHTML();
        const chains = this.getChainsHTML();
        
        return `
            <div class="modal-content quest-modal">
                <div class="modal-header">
                    <h2>📋 Quest Log</h2>
                    <div class="quest-stats">
                        <span class="stat">Quest Points: <strong>${this.questPoints}</strong></span>
                        <span class="stat">Completed: <strong>${this.totalQuestsCompleted}</strong></span>
                        <span class="stat">Daily Streak: <strong>${this.streaks.daily}🔥</strong></span>
                    </div>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="quest-tabs">
                    <button class="quest-tab active" data-tab="story">Story</button>
                    <button class="quest-tab" data-tab="daily">Daily</button>
                    <button class="quest-tab" data-tab="weekly">Weekly</button>
                    <button class="quest-tab" data-tab="achievements">Achievements</button>
                    <button class="quest-tab" data-tab="chains">Chains</button>
                </div>
                <div class="quest-content">
                    <div class="quest-panel active" id="story-panel">${storyQuests}</div>
                    <div class="quest-panel" id="daily-panel">${dailyQuests}</div>
                    <div class="quest-panel" id="weekly-panel">${weeklyQuests}</div>
                    <div class="quest-panel" id="achievements-panel">${achievements}</div>
                    <div class="quest-panel" id="chains-panel">${chains}</div>
                </div>
            </div>
        `;
    }

    getStoryQuestsHTML() {
        const quests = this.quests.story.sort((a, b) => a.order - b.order);
        return quests.map(q => {
            const completed = this.completedQuests.has(q.id);
            const progress = this.getQuestProgress(q);
            const pct = Math.floor(progress * 100);
            
            return `
                <div class="quest-card ${completed ? 'completed' : ''} ${q.tier}">
                    <div class="quest-icon">${q.icon}</div>
                    <div class="quest-info">
                        <div class="quest-name">${q.name}</div>
                        <div class="quest-desc">${q.description}</div>
                        ${!completed ? `<div class="progress-bar"><div class="progress-fill" style="width: ${pct}%"></div></div>` : ''}
                    </div>
                    <div class="quest-reward">
                        ${completed ? '✅' : `<span class="tier-badge">${q.tier}</span>`}
                    </div>
                </div>
            `;
        }).join('');
    }

    getDailyQuestsHTML() {
        if (this.dailyQuests.length === 0) {
            return '<div class="empty-state">No daily quests available. Check back tomorrow!</div>';
        }
        
        return this.dailyQuests.map(q => {
            const progress = q.requirement.current / q.requirement.value;
            const pct = Math.floor(Math.min(progress, 1) * 100);
            const canClaim = progress >= 1 && !q.claimed;
            
            return `
                <div class="quest-card ${q.claimed ? 'claimed' : ''} ${q.tier}">
                    <div class="quest-icon">${q.icon}</div>
                    <div class="quest-info">
                        <div class="quest-name">${q.name}</div>
                        <div class="quest-desc">${q.description}</div>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${pct}%"></div></div>
                        <div class="progress-text">${this.formatNumber(q.requirement.current)} / ${this.formatNumber(q.requirement.value)}</div>
                    </div>
                    <div class="quest-actions">
                        ${canClaim 
                            ? `<button class="claim-btn" data-quest="${q.id}">Claim</button>`
                            : q.claimed ? '✅' : `<span class="tier-badge">${q.tier}</span>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    getWeeklyQuestsHTML() {
        if (this.weeklyQuests.length === 0) {
            return '<div class="empty-state">No weekly quests available. Check back next week!</div>';
        }
        
        return this.weeklyQuests.map(q => {
            const progress = q.requirement.current / q.requirement.value;
            const pct = Math.floor(Math.min(progress, 1) * 100);
            const canClaim = progress >= 1 && !q.claimed;
            const streakBonus = q.streakBonus ? `+${Math.floor(q.streakBonus * 100)}%` : '';
            
            return `
                <div class="quest-card ${q.claimed ? 'claimed' : ''} ${q.tier}">
                    <div class="quest-icon">${q.icon}</div>
                    <div class="quest-info">
                        <div class="quest-name">${q.name} ${streakBonus ? `<span class="streak-bonus">${streakBonus}</span>` : ''}</div>
                        <div class="quest-desc">${q.description}</div>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${pct}%"></div></div>
                        <div class="progress-text">${this.formatNumber(q.requirement.current)} / ${this.formatNumber(q.requirement.value)}</div>
                    </div>
                    <div class="quest-actions">
                        ${canClaim 
                            ? `<button class="claim-btn" data-quest="${q.id}">Claim</button>`
                            : q.claimed ? '✅' : `<span class="tier-badge">${q.tier}</span>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    getAchievementsHTML() {
        return this.quests.achievements.map(q => {
            const completed = this.completedQuests.has(q.id);
            const progress = this.getQuestProgress(q);
            const pct = Math.floor(progress * 100);
            const claimed = this.claimedRewards.has(q.id);
            const canClaim = completed && !claimed;
            
            return `
                <div class="quest-card ${completed ? 'completed' : ''} ${claimed ? 'claimed' : ''} ${q.tier}">
                    <div class="quest-icon">${q.icon}</div>
                    <div class="quest-info">
                        <div class="quest-name">${q.name}</div>
                        <div class="quest-desc">${q.description}</div>
                        ${!completed ? `<div class="progress-bar"><div class="progress-fill" style="width: ${pct}%"></div></div>` : ''}
                    </div>
                    <div class="quest-actions">
                        ${canClaim 
                            ? `<button class="claim-btn" data-quest="${q.id}">Claim ${q.reward.processors || 1}⚙️</button>`
                            : claimed ? '✅' : `<span class="tier-badge">${q.tier}</span>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    getChainsHTML() {
        if (this.currentQuestChain) {
            const chain = this.currentQuestChain;
            const currentStep = chain.steps[this.chainProgress];
            
            return `
                <div class="active-chain">
                    <h3>⚔️ Active: ${chain.name}</h3>
                    <p>${chain.description}</p>
                    <div class="chain-steps">
                        ${chain.steps.map((step, i) => {
                            const status = i < this.chainProgress ? 'completed' : i === this.chainProgress ? 'active' : 'pending';
                            return `
                                <div class="chain-step ${status}">
                                    <div class="step-number">${i + 1}</div>
                                    <div class="step-name">${step.name}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ${currentStep ? `
                        <div class="current-step">
                            <div class="step-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.floor(this.getQuestProgress(currentStep) * 100)}%"></div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        const completedChains = this.quests.chains.filter(c => this.completedQuests.has(`chain_${c.id}_complete`));
        if (completedChains.length === 0) {
            return '<div class="empty-state">No active quest chain. Continue playing to unlock one!</div>';
        }
        
        return completedChains.map(c => `
            <div class="completed-chain">
                <h4>🏆 ${c.name}</h4>
                <p>Completed</p>
            </div>
        `).join('');
    }

    attachModalListeners(modal) {
        modal.querySelectorAll('.quest-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modal.querySelectorAll('.quest-tab').forEach(t => t.classList.remove('active'));
                modal.querySelectorAll('.quest-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                modal.querySelector(`#${tab.dataset.tab}-panel`).classList.add('active');
            });
        });

        modal.querySelectorAll('.claim-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const questId = btn.dataset.quest;
                const quest = this.findQuestById(questId);
                if (quest) {
                    this.claimReward(quest);
                    this.refreshModal();
                }
            });
        });

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    findQuestById(id) {
        const daily = this.dailyQuests.find(q => q.id === id);
        if (daily) return daily;
        
        const weekly = this.weeklyQuests.find(q => q.id === id);
        if (weekly) return weekly;
        
        const achievement = this.quests.achievements.find(q => q.id === id);
        if (achievement) return achievement;
        
        return null;
    }

    refreshModal() {
        const modal = document.getElementById('quest-modal');
        if (modal) {
            modal.innerHTML = this.getQuestModalHTML();
            this.attachModalListeners(modal);
        }
    }

    getSaveData() {
        return {
            unlocked: this.unlocked,
            completedQuests: Array.from(this.completedQuests),
            claimedRewards: Array.from(this.claimedRewards),
            questPoints: this.questPoints,
            totalQuestsCompleted: this.totalQuestsCompleted,
            dailyQuests: this.dailyQuests,
            weeklyQuests: this.weeklyQuests,
            lastDailyReset: this.lastDailyReset,
            lastWeeklyReset: this.lastWeeklyReset,
            currentQuestChain: this.currentQuestChain?.id || null,
            chainProgress: this.chainProgress,
            streaks: this.streaks
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.completedQuests = new Set(data.completedQuests || []);
        this.claimedRewards = new Set(data.claimedRewards || []);
        this.questPoints = data.questPoints || 0;
        this.totalQuestsCompleted = data.totalQuestsCompleted || 0;
        this.dailyQuests = data.dailyQuests || [];
        this.weeklyQuests = data.weeklyQuests || [];
        this.lastDailyReset = data.lastDailyReset || Date.now();
        this.lastWeeklyReset = data.lastWeeklyReset || Date.now();
        this.chainProgress = data.chainProgress || 0;
        this.streaks = data.streaks || { daily: 0, weekly: 0, lastDaily: 0, lastWeekly: 0 };
        
        if (data.currentQuestChain) {
            this.currentQuestChain = this.quests.chains.find(c => c.id === data.currentQuestChain) || null;
        }
    }
}

class SeasonPassManager {
    constructor(game) {
        this.game = game;
        this.seasonNumber = 1;
        this.seasonName = 'Galactic Awakening';
        this.seasonStartDate = Date.now();
        this.seasonEndDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
        this.currentTier = 1;
        this.maxTier = 100;
        this.currentXP = 0;
        this.xpToNextTier = 1000;
        this.xpMultiplier = 1;
        this.hasPremium = false;
        this.premiumPrice = 999;
        this.claimedFreeRewards = new Set();
        this.claimedPremiumRewards = new Set();
        this.seasonRewards = this.initSeasonRewards();
        this.xpSources = new Map();
        this.dailyXPProgress = { earned: 0, max: 50000, lastReset: Date.now() };
        this.seasonChallenges = this.initSeasonChallenges();
        this.unlockedSkins = new Set();
        this.unlockedTitles = new Set();
        this.activeSkin = 'default';
        this.activeTitle = null;
        this.seasonMultiplier = 1;
        this.xpBoostActive = false;
        this.xpBoostExpiry = 0;
    }

    initSeasonRewards() {
        const rewards = [];
        
        for (let tier = 1; tier <= this.maxTier; tier++) {
            const tierRewards = {
                tier: tier,
                free: this.generateFreeReward(tier),
                premium: this.generatePremiumReward(tier)
            };
            rewards.push(tierRewards);
        }
        
        return rewards;
    }

    generateFreeReward(tier) {
        if (tier === 1) return { type: 'skin', id: 'seasonal_paperclip', name: 'Seasonal Paperclip', icon: '📎' };
        if (tier === 10) return { type: 'boost', id: 'production_boost', name: '24h Production Boost', value: 2, duration: 86400000, icon: '⚡' };
        if (tier === 25) return { type: 'matter', value: 1000000, icon: '🧱' };
        if (tier === 50) return { type: 'artifact_fragment', value: 5, icon: '✨' };
        if (tier === 75) return { type: 'title', id: 'season_veteran', name: 'Season Veteran', icon: '🏅' };
        if (tier === 100) return { type: 'skin', id: 'legendary_paperclip', name: 'Legendary Paperclip', icon: '💎' };
        
        if (tier % 5 === 0) {
            return { type: 'energy', value: tier * 10000, icon: '⚡' };
        }
        if (tier % 3 === 0) {
            return { type: 'matter', value: tier * 1000, icon: '🧱' };
        }
        if (tier % 2 === 0) {
            return { type: 'research_points', value: Math.floor(tier / 2), icon: '🔬' };
        }
        
        return { type: 'clips', value: tier * 100, icon: '📎' };
    }

    generatePremiumReward(tier) {
        if (tier === 1) return { type: 'skin', id: 'premium_paperclip', name: 'Premium Paperclip', icon: '👑' };
        if (tier === 5) return { type: 'xp_boost', name: 'XP Boost Token', value: 7, duration: 604800000, icon: '🚀' };
        if (tier === 10) return { type: 'processors', value: 10, icon: '⚙️' };
        if (tier === 25) return { type: 'artifact', rarity: 'epic', icon: '🏺' };
        if (tier === 50) return { type: 'skin', id: 'cosmic_paperclip', name: 'Cosmic Paperclip', icon: '🌌' };
        if (tier === 75) return { type: 'title', id: 'season_elite', name: 'Season Elite', icon: '👑' };
        if (tier === 100) return { type: 'skin', id: 'divine_paperclip', name: 'Divine Paperclip', icon: '✨' };
        
        if (tier % 5 === 0) {
            return { type: 'processors', value: Math.floor(tier / 5), icon: '⚙️' };
        }
        if (tier % 3 === 0) {
            return { type: 'divinity_points', value: Math.floor(tier / 10) + 1, icon: '⭐' };
        }
        if (tier % 2 === 0) {
            return { type: 'faith', value: tier * 10, icon: '🙏' };
        }
        
        return { type: 'matter', value: tier * 5000, icon: '🧱' };
    }

    initSeasonChallenges() {
        return [
            { id: 'sc_daily_clips', name: 'Daily Producer', description: 'Make 10,000 paperclips', xp: 500, requirement: { type: 'clips', value: 10000 }, progress: 0, completed: false },
            { id: 'sc_daily_buildings', name: 'Builder', description: 'Purchase 50 buildings', xp: 400, requirement: { type: 'buildings', value: 50 }, progress: 0, completed: false },
            { id: 'sc_daily_research', name: 'Researcher', description: 'Complete 3 research projects', xp: 600, requirement: { type: 'research', value: 3 }, progress: 0, completed: false },
            { id: 'sc_daily_prestige', name: 'Prestigious', description: 'Prestige once', xp: 1000, requirement: { type: 'prestige', value: 1 }, progress: 0, completed: false },
            { id: 'sc_daily_boss', name: 'Boss Hunter', description: 'Defeat a world boss', xp: 800, requirement: { type: 'boss_kill', value: 1 }, progress: 0, completed: false },
            { id: 'sc_daily_conquest', name: 'Conqueror', description: 'Conquer 2 regions', xp: 700, requirement: { type: 'conquest', value: 2 }, progress: 0, completed: false },
            { id: 'sc_weekly_clips', name: 'Weekly Marathon', description: 'Make 1M paperclips', xp: 2000, requirement: { type: 'clips', value: 1000000 }, progress: 0, completed: false },
            { id: 'sc_weekly_prestige', name: 'Ascension', description: 'Prestige 5 times', xp: 2500, requirement: { type: 'prestige', value: 5 }, progress: 0, completed: false },
            { id: 'sc_weekly_artifacts', name: 'Artifact Hunter', description: 'Forge 10 artifacts', xp: 1500, requirement: { type: 'artifacts', value: 10 }, progress: 0, completed: false }
        ];
    }

    tick() {
        this.checkSeasonExpiry();
        this.checkChallenges();
        this.updateXPBoost();
        
        const dayMs = 24 * 60 * 60 * 1000;
        if (Date.now() - this.dailyXPProgress.lastReset > dayMs) {
            this.dailyXPProgress.earned = 0;
            this.dailyXPProgress.lastReset = Date.now();
            this.resetDailyChallenges();
        }
    }

    checkSeasonExpiry() {
        if (Date.now() > this.seasonEndDate) {
            this.startNewSeason();
        }
    }

    startNewSeason() {
        this.seasonNumber++;
        this.seasonName = this.generateSeasonName();
        this.seasonStartDate = Date.now();
        this.seasonEndDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
        this.currentTier = 1;
        this.currentXP = 0;
        this.claimedFreeRewards.clear();
        this.claimedPremiumRewards.clear();
        this.seasonRewards = this.initSeasonRewards();
        this.seasonChallenges = this.initSeasonChallenges();
        this.hasPremium = false;
        this.seasonMultiplier = Math.min(1 + (this.seasonNumber - 1) * 0.1, 3);
        
        this.game.log(`🎉 Season ${this.seasonNumber}: "${this.seasonName}" has begun!`);
        this.showSeasonStartModal();
    }

    generateSeasonName() {
        const names = [
            'Cosmic Expansion', 'Quantum Leap', 'Stellar Conquest', 'Void Awakening',
            'Nebula Rising', 'Galactic Dominion', 'Universal Order', 'Eternal Empire',
            'Transcendence', 'The Great Harvest', 'Dimensional Shift', 'Reality Break'
        ];
        return names[(this.seasonNumber - 1) % names.length];
    }

    checkChallenges() {
        for (const challenge of this.seasonChallenges) {
            if (challenge.completed) continue;
            
            let progress = 0;
            switch (challenge.requirement.type) {
                case 'clips':
                    progress = this.game.stats?.totalProduced || 0;
                    break;
                case 'buildings':
                    progress = this.game.buildings?.reduce((sum, b) => sum + b.count, 0) || 0;
                    break;
                case 'research':
                    progress = this.game.researchManager?.completed?.length || 0;
                    break;
                case 'prestige':
                    progress = this.game.prestigeCount || 0;
                    break;
                case 'boss_kill':
                    progress = this.game.worldBossManager?.bossHistory?.length || 0;
                    break;
                case 'conquest':
                    progress = this.game.universalDominationManager?.conqueredRegions?.size || 0;
                    break;
                case 'artifacts':
                    progress = this.game.artifactForgeManager?.craftedArtifacts?.length || 0;
                    break;
            }
            
            challenge.progress = Math.min(progress, challenge.requirement.value);
            
            if (challenge.progress >= challenge.requirement.value) {
                this.completeChallenge(challenge);
            }
        }
    }

    completeChallenge(challenge) {
        challenge.completed = true;
        this.addXP(challenge.xp, 'challenge');
        this.game.log(`🎯 Season Challenge Complete: ${challenge.name} (+${challenge.xp} XP)`);
    }

    resetDailyChallenges() {
        for (const challenge of this.seasonChallenges) {
            if (!challenge.id.startsWith('sc_weekly')) {
                challenge.progress = 0;
                challenge.completed = false;
            }
        }
    }

    addXP(amount, source = 'general') {
        if (this.xpBoostActive && Date.now() < this.xpBoostExpiry) {
            amount *= 2;
        }
        
        const actualXP = Math.floor(amount * this.seasonMultiplier);
        this.currentXP += actualXP;
        
        this.xpSources.set(source, (this.xpSources.get(source) || 0) + actualXP);
        this.dailyXPProgress.earned += actualXP;
        
        this.checkTierProgression();
    }

    checkTierProgression() {
        const xpNeeded = this.calculateXPForTier(this.currentTier);
        
        while (this.currentXP >= xpNeeded && this.currentTier < this.maxTier) {
            this.currentXP -= xpNeeded;
            this.currentTier++;
            this.onTierUp();
        }
    }

    calculateXPForTier(tier) {
        return Math.floor(1000 * Math.pow(1.05, tier - 1));
    }

    onTierUp() {
        this.game.log(`🎉 Season Pass Tier ${this.currentTier} reached!`);
        
        const reward = this.seasonRewards[this.currentTier - 1];
        if (reward && reward.free) {
            this.showRewardNotification(reward.free, 'free');
        }
        if (this.hasPremium && reward && reward.premium) {
            this.showRewardNotification(reward.premium, 'premium');
        }
    }

    showRewardNotification(reward, track) {
        const trackLabel = track === 'premium' ? '👑 Premium' : '🆓 Free';
        this.game.log(`${trackLabel} Reward Unlocked: ${reward.name || reward.type}`);
    }

    purchasePremium() {
        if (this.hasPremium) return false;
        
        if (this.game.processors >= this.premiumPrice) {
            this.game.processors -= this.premiumPrice;
            this.hasPremium = true;
            this.claimAllPremiumRewards();
            this.game.log('👑 Season Pass Premium activated! All premium rewards claimed!');
            return true;
        }
        return false;
    }

    claimAllPremiumRewards() {
        for (let i = 1; i <= this.currentTier; i++) {
            if (!this.claimedPremiumRewards.has(i)) {
                this.claimReward(i, 'premium', true);
            }
        }
    }

    claimReward(tier, track, silent = false) {
        const claimedSet = track === 'premium' ? this.claimedPremiumRewards : this.claimedFreeRewards;
        
        if (claimedSet.has(tier)) return false;
        if (tier > this.currentTier) return false;
        if (track === 'premium' && !this.hasPremium) return false;
        
        const reward = this.seasonRewards[tier - 1]?.[track];
        if (!reward) return false;
        
        this.grantReward(reward);
        claimedSet.add(tier);
        
        if (!silent) {
            const trackLabel = track === 'premium' ? '👑 Premium' : '🆓 Free';
            this.game.log(`${trackLabel} Reward Claimed: ${reward.name || reward.type}`);
        }
        
        return true;
    }

    grantReward(reward) {
        switch (reward.type) {
            case 'matter':
                this.game.matter += reward.value;
                break;
            case 'energy':
                this.game.energy += reward.value;
                break;
            case 'clips':
                this.game.paperclips += reward.value;
                break;
            case 'processors':
                if (this.game.processors !== undefined) this.game.processors += reward.value;
                break;
            case 'research_points':
                if (this.game.researchPoints !== undefined) this.game.researchPoints += reward.value;
                break;
            case 'divinity_points':
                if (this.game.divineManager) this.game.divineManager.divinityPoints = (this.game.divineManager.divinityPoints || 0) + reward.value;
                break;
            case 'faith':
                if (this.game.pantheonManager) this.game.pantheonManager.faith += reward.value;
                break;
            case 'artifact_fragment':
                if (this.game.artifactForgeManager) this.game.artifactForgeManager.fragments = (this.game.artifactForgeManager.fragments || 0) + reward.value;
                break;
            case 'skin':
                this.unlockedSkins.add(reward.id);
                break;
            case 'title':
                this.unlockedTitles.add(reward.id);
                this.activeTitle = reward.id;
                break;
            case 'boost':
                this.applyBoost(reward);
                break;
            case 'xp_boost':
                this.activateXPBoost(reward.duration);
                break;
            case 'artifact':
                this.grantArtifact(reward.rarity);
                break;
        }
    }

    grantArtifact(rarity) {
        if (this.game.artifactForgeManager) {
            const artifact = this.game.artifactForgeManager.createRandomArtifact(rarity);
            this.game.log(`✨ Season Pass Artifact: ${artifact.name}`);
        }
    }

    applyBoost(boost) {
        this.game.activeBoosts = this.game.activeBoosts || {};
        this.game.activeBoosts[boost.id] = {
            multiplier: boost.value,
            expiry: Date.now() + boost.duration
        };
        this.game.log(`⚡ ${boost.name} activated!`);
    }

    activateXPBoost(duration) {
        this.xpBoostActive = true;
        this.xpBoostExpiry = Date.now() + duration;
        this.game.log('🚀 XP Boost activated! Double XP for 7 days!');
    }

    updateXPBoost() {
        if (this.xpBoostActive && Date.now() > this.xpBoostExpiry) {
            this.xpBoostActive = false;
            this.game.log('XP Boost has expired.');
        }
    }

    setActiveSkin(skinId) {
        if (this.unlockedSkins.has(skinId)) {
            this.activeSkin = skinId;
            return true;
        }
        return false;
    }

    setActiveTitle(titleId) {
        if (this.unlockedTitles.has(titleId)) {
            this.activeTitle = titleId;
            return true;
        }
        return false;
    }

    getSkinDisplay() {
        const skinMap = {
            'default': '📎',
            'seasonal_paperclip': '🌟',
            'premium_paperclip': '👑',
            'cosmic_paperclip': '🌌',
            'legendary_paperclip': '💎',
            'divine_paperclip': '✨'
        };
        return skinMap[this.activeSkin] || '📎';
    }

    getTitleDisplay() {
        const titleMap = {
            'season_veteran': '🏅 Season Veteran',
            'season_elite': '👑 Season Elite'
        };
        return titleMap[this.activeTitle] || '';
    }

    showSeasonPassModal() {
        const modal = document.createElement('div');
        modal.className = 'modal season-pass-modal';
        modal.id = 'season-pass-modal';
        modal.innerHTML = this.getSeasonPassModalHTML();
        document.body.appendChild(modal);
        this.attachModalListeners(modal);
    }

    showSeasonStartModal() {
        const modal = document.createElement('div');
        modal.className = 'modal season-start-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span class="modal-icon">🎉</span>
                    <h2>Season ${this.seasonNumber}: ${this.seasonName}</h2>
                </div>
                <div class="modal-body">
                    <p class="season-welcome">A new season has begun! Complete challenges and earn XP to unlock exclusive rewards.</p>
                    <div class="season-highlights">
                        <div class="highlight">
                            <span class="icon">📈</span>
                            <span>100 Tiers of Rewards</span>
                        </div>
                        <div class="highlight">
                            <span class="icon">👑</span>
                            <span>Premium Pass Available</span>
                        </div>
                        <div class="highlight">
                            <span class="icon">🎨</span>
                            <span>Exclusive Skins & Titles</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn" onclick="this.closest('.modal').remove()">Let's Go!</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    getSeasonPassModalHTML() {
        const xpForNext = this.calculateXPForTier(this.currentTier);
        const progressPercent = Math.min((this.currentXP / xpForNext) * 100, 100);
        const timeRemaining = this.seasonEndDate - Date.now();
        const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
        
        return `
            <div class="modal-content season-pass-content">
                <div class="modal-header">
                    <div class="season-title">
                        <h2>🎮 Season ${this.seasonNumber}: ${this.seasonName}</h2>
                        <span class="season-timer">${daysRemaining} days remaining</span>
                    </div>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="season-progress-section">
                    <div class="tier-display">
                        <span class="current-tier">Tier ${this.currentTier}</span>
                        <span class="tier-progress">${this.formatNumber(this.currentXP)} / ${this.formatNumber(xpForNext)} XP</span>
                    </div>
                    <div class="progress-bar large">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    ${this.xpBoostActive ? '<span class="xp-boost-badge">🚀 2x XP Active</span>' : ''}
                </div>
                
                ${!this.hasPremium ? `
                <div class="premium-banner">
                    <div class="premium-info">
                        <h3>👑 Unlock Premium Pass</h3>
                        <p>Get exclusive rewards at every tier!</p>
                    </div>
                    <button class="buy-premium-btn" onclick="game.seasonPassManager.purchasePremium(); game.seasonPassManager.refreshModal()">
                        ${this.premiumPrice} ⚙️
                    </button>
                </div>
                ` : '<div class="premium-active-banner">👑 Premium Active</div>'}
                
                <div class="rewards-track">
                    <div class="track-labels">
                        <span class="track-label free-label">🆓 Free</span>
                        ${this.hasPremium ? '<span class="track-label premium-label">👑 Premium</span>' : '<span class="track-label premium-locked">🔒 Premium</span>'}
                    </div>
                    <div class="tiers-container">
                        ${this.getTierRewardsHTML()}
                    </div>
                </div>
                
                <div class="challenges-section">
                    <h3>🎯 Season Challenges</h3>
                    <div class="challenges-list">
                        ${this.getChallengesHTML()}
                    </div>
                </div>
                
                ${this.unlockedSkins.size > 0 ? `
                <div class="customization-section">
                    <h3>🎨 Customization</h3>
                    <div class="skins-grid">
                        ${Array.from(this.unlockedSkins).map(skin => `
                            <button class="skin-btn ${this.activeSkin === skin ? 'active' : ''}" 
                                    onclick="game.seasonPassManager.setActiveSkin('${skin}'); game.seasonPassManager.refreshModal()">
                                ${this.getSkinEmoji(skin)}
                            </button>
                        `).join('')}
                    </div>
                    ${this.unlockedTitles.size > 0 ? `
                    <div class="titles-list">
                        ${Array.from(this.unlockedTitles).map(title => `
                            <button class="title-btn ${this.activeTitle === title ? 'active' : ''}"
                                    onclick="game.seasonPassManager.setActiveTitle('${title}'); game.seasonPassManager.refreshModal()">
                                ${this.getTitleDisplayName(title)}
                            </button>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        `;
    }

    getTierRewardsHTML() {
        const visibleTiers = Math.min(this.currentTier + 5, this.maxTier);
        const startTier = Math.max(1, this.currentTier - 2);
        
        let html = '';
        for (let i = startTier; i <= visibleTiers; i++) {
            const reward = this.seasonRewards[i - 1];
            const isCurrent = i === this.currentTier;
            const freeClaimed = this.claimedFreeRewards.has(i);
            const premiumClaimed = this.claimedPremiumRewards.has(i);
            const canClaimFree = i <= this.currentTier && !freeClaimed;
            const canClaimPremium = this.hasPremium && i <= this.currentTier && !premiumClaimed;
            
            html += `
                <div class="tier-row ${isCurrent ? 'current' : ''} ${i > this.currentTier ? 'locked' : ''}">
                    <span class="tier-number">${i}</span>
                    <div class="tier-rewards">
                        <div class="reward-slot free ${freeClaimed ? 'claimed' : ''} ${canClaimFree ? 'claimable' : ''}"
                             onclick="${canClaimFree ? `game.seasonPassManager.claimReward(${i}, 'free'); game.seasonPassManager.refreshModal()` : ''}">
                            <span class="reward-icon">${reward.free.icon}</span>
                            ${canClaimFree ? '<span class="claim-indicator">👆</span>' : ''}
                            ${freeClaimed ? '✓' : ''}
                        </div>
                        <div class="reward-slot premium ${premiumClaimed ? 'claimed' : ''} ${canClaimPremium ? 'claimable' : ''} ${!this.hasPremium ? 'locked' : ''}"
                             onclick="${canClaimPremium ? `game.seasonPassManager.claimReward(${i}, 'premium'); game.seasonPassManager.refreshModal()` : ''}">
                            <span class="reward-icon">${reward.premium.icon}</span>
                            ${canClaimPremium ? '<span class="claim-indicator">👆</span>' : ''}
                            ${premiumClaimed ? '✓' : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        return html;
    }

    getChallengesHTML() {
        return this.seasonChallenges.map(c => {
            const pct = Math.min((c.progress / c.requirement.value) * 100, 100);
            return `
                <div class="challenge-card ${c.completed ? 'completed' : ''}">
                    <div class="challenge-info">
                        <div class="challenge-name">${c.name}</div>
                        <div class="challenge-desc">${c.description}</div>
                        ${!c.completed ? `
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${pct}%"></div>
                        </div>
                        <div class="progress-text">${this.formatNumber(c.progress)} / ${this.formatNumber(c.requirement.value)}</div>
                        ` : '<span class="completed-badge">✓ Completed</span>'}
                    </div>
                    <div class="challenge-xp">+${c.xp} XP</div>
                </div>
            `;
        }).join('');
    }

    getSkinEmoji(skinId) {
        const map = {
            'seasonal_paperclip': '🌟',
            'premium_paperclip': '👑',
            'cosmic_paperclip': '🌌',
            'legendary_paperclip': '💎',
            'divine_paperclip': '✨'
        };
        return map[skinId] || '📎';
    }

    getTitleDisplayName(titleId) {
        const map = {
            'season_veteran': '🏅 Season Veteran',
            'season_elite': '👑 Season Elite'
        };
        return map[titleId] || titleId;
    }

    attachModalListeners(modal) {
        modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }

    refreshModal() {
        const modal = document.getElementById('season-pass-modal');
        if (modal) {
            modal.innerHTML = this.getSeasonPassModalHTML();
            this.attachModalListeners(modal);
        }
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    getSaveData() {
        return {
            seasonNumber: this.seasonNumber,
            seasonName: this.seasonName,
            seasonStartDate: this.seasonStartDate,
            seasonEndDate: this.seasonEndDate,
            currentTier: this.currentTier,
            currentXP: this.currentXP,
            hasPremium: this.hasPremium,
            claimedFreeRewards: Array.from(this.claimedFreeRewards),
            claimedPremiumRewards: Array.from(this.claimedPremiumRewards),
            unlockedSkins: Array.from(this.unlockedSkins),
            unlockedTitles: Array.from(this.unlockedTitles),
            activeSkin: this.activeSkin,
            activeTitle: this.activeTitle,
            xpBoostActive: this.xpBoostActive,
            xpBoostExpiry: this.xpBoostExpiry,
            seasonChallenges: this.seasonChallenges,
            dailyXPProgress: this.dailyXPProgress
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.seasonNumber = data.seasonNumber || 1;
        this.seasonName = data.seasonName || 'Galactic Awakening';
        this.seasonStartDate = data.seasonStartDate || Date.now();
        this.seasonEndDate = data.seasonEndDate || Date.now() + (30 * 24 * 60 * 60 * 1000);
        this.currentTier = data.currentTier || 1;
        this.currentXP = data.currentXP || 0;
        this.hasPremium = data.hasPremium || false;
        this.claimedFreeRewards = new Set(data.claimedFreeRewards || []);
        this.claimedPremiumRewards = new Set(data.claimedPremiumRewards || []);
        this.unlockedSkins = new Set(data.unlockedSkins || []);
        this.unlockedTitles = new Set(data.unlockedTitles || []);
        this.activeSkin = data.activeSkin || 'default';
        this.activeTitle = data.activeTitle || null;
        this.xpBoostActive = data.xpBoostActive || false;
        this.xpBoostExpiry = data.xpBoostExpiry || 0;
        this.seasonChallenges = data.seasonChallenges || this.initSeasonChallenges();
        this.dailyXPProgress = data.dailyXPProgress || { earned: 0, max: 50000, lastReset: Date.now() };
        this.seasonMultiplier = Math.min(1 + (this.seasonNumber - 1) * 0.1, 3);
    }
}

class PetManager {
    constructor(game) {
        this.game = game;
        this.unlockedPets = new Map();
        this.activePet = null;
        this.petDefinitions = this.initPetDefinitions();
        this.petFood = 0;
        this.petToys = 0;
        this.totalPetLevel = 0;
        this.bondingPoints = 0;
        this.petEquipment = new Map();
        this.petAbilitiesUnlocked = new Set();
        this.petAchievements = new Set();
    }

    initPetDefinitions() {
        return {
            clipling: {
                id: 'clipling',
                name: 'Clip-ling',
                description: 'A small paperclip-shaped creature that loves to help with production.',
                icon: '📎',
                rarity: 'common',
                unlockRequirement: { type: 'clips', value: 1000 },
                baseStats: { productionBonus: 0.05, energyBonus: 0, matterBonus: 0 },
                growthRate: { production: 0.01, energy: 0, matter: 0 },
                maxLevel: 50,
                abilities: [
                    { level: 10, name: 'Clip Assist', effect: 'Auto-clicks once every 10 seconds' },
                    { level: 25, name: 'Production Boost', effect: '+10% global production' },
                    { level: 50, name: 'Master Clipper', effect: '+25% clip production' }
                ],
                evolution: null,
                favoriteFood: 'metal_shavings',
                personality: 'helpful'
            },
            matter_muncher: {
                id: 'matter_muncher',
                name: 'Matter Muncher',
                description: 'A creature that feeds on raw matter and helps gather resources.',
                icon: '🦠',
                rarity: 'common',
                unlockRequirement: { type: 'matter', value: 10000 },
                baseStats: { productionBonus: 0, energyBonus: 0, matterBonus: 0.1 },
                growthRate: { production: 0, energy: 0, matter: 0.02 },
                maxLevel: 50,
                abilities: [
                    { level: 10, name: 'Matter Sense', effect: '+5% matter gathering' },
                    { level: 25, name: 'Efficient Digestion', effect: '-10% building costs' },
                    { level: 50, name: 'Matter Master', effect: '+25% matter production' }
                ],
                evolution: 'matter_titan',
                favoriteFood: 'raw_matter',
                personality: 'greedy'
            },
            energy_sprite: {
                id: 'energy_sprite',
                name: 'Energy Sprite',
                description: 'A glowing entity that crackles with electrical energy.',
                icon: '⚡',
                rarity: 'uncommon',
                unlockRequirement: { type: 'energy', value: 1000000 },
                baseStats: { productionBonus: 0, energyBonus: 0.08, matterBonus: 0 },
                growthRate: { production: 0, energy: 0.015, matter: 0 },
                maxLevel: 75,
                abilities: [
                    { level: 10, name: 'Static Charge', effect: '+5% energy generation' },
                    { level: 25, name: 'Power Surge', effect: 'Occasional energy refunds' },
                    { level: 50, name: 'Lightning Speed', effect: '+15% automation speed' },
                    { level: 75, name: 'Infinite Power', effect: '+30% energy production' }
                ],
                evolution: 'storm_wisp',
                favoriteFood: 'energy_crystals',
                personality: 'energetic'
            },
            quantum_cat: {
                id: 'quantum_cat',
                name: 'Quantum Cat',
                description: 'A cat that exists in multiple states simultaneously. Schrödinger would be proud.',
                icon: '🐱',
                rarity: 'rare',
                unlockRequirement: { type: 'research', tech: 'quantum' },
                baseStats: { productionBonus: 0.1, energyBonus: 0.05, matterBonus: 0.05 },
                growthRate: { production: 0.02, energy: 0.01, matter: 0.01 },
                maxLevel: 100,
                abilities: [
                    { level: 10, name: 'Superposition', effect: 'Random resource bonuses' },
                    { level: 25, name: 'Quantum Tunnel', effect: 'Bypass some costs' },
                    { level: 50, name: 'Probability Wave', effect: 'Better random events' },
                    { level: 75, name: 'Entanglement', effect: 'Linked bonus with other pets' },
                    { level: 100, name: 'Quantum Supremacy', effect: 'All stats +20%' }
                ],
                evolution: 'cosmic_feline',
                favoriteFood: 'quantum_treats',
                personality: 'mysterious'
            },
            void_puppy: {
                id: 'void_puppy',
                name: 'Void Puppy',
                description: 'An adorable creature from the void dimension. Don\'t let it near your socks.',
                icon: '🐕',
                rarity: 'rare',
                unlockRequirement: { type: 'void', value: 1 },
                baseStats: { productionBonus: 0.15, energyBonus: 0.1, matterBonus: 0 },
                growthRate: { production: 0.025, energy: 0.015, matter: 0.005 },
                maxLevel: 100,
                abilities: [
                    { level: 10, name: 'Void Gaze', effect: 'Reveals hidden bonuses' },
                    { level: 25, name: 'Dark Matter Fetch', effect: 'Auto-gathers void resources' },
                    { level: 50, name: 'Shadow Step', effect: 'Faster prestige cycles' },
                    { level: 75, name: 'Abyssal Howl', effect: 'Boosts all void systems' },
                    { level: 100, name: 'Void Lord', effect: 'Dominates the darkness' }
                ],
                evolution: 'abyssal_hound',
                favoriteFood: 'void_essence',
                personality: 'loyal'
            },
            galaxy_dragon: {
                id: 'galaxy_dragon',
                name: 'Galaxy Dragon',
                description: 'A majestic dragon made of stardust and cosmic energy.',
                icon: '🐉',
                rarity: 'epic',
                unlockRequirement: { type: 'conquest', value: 5 },
                baseStats: { productionBonus: 0.2, energyBonus: 0.15, matterBonus: 0.15 },
                growthRate: { production: 0.03, energy: 0.02, matter: 0.02 },
                maxLevel: 150,
                abilities: [
                    { level: 10, name: 'Stellar Breath', effect: 'Boosts star forges' },
                    { level: 25, name: 'Cosmic Wisdom', effect: 'Research speed +20%' },
                    { level: 50, name: 'Galactic Roar', effect: 'Global production +15%' },
                    { level: 75, name: 'Nebula Shield', effect: 'Crisis prevention' },
                    { level: 100, name: 'Supernova', effect: 'Massive burst production' },
                    { level: 150, name: 'Universal Dragon', effect: 'All bonuses doubled' }
                ],
                evolution: 'celestial_wyrm',
                favoriteFood: 'star_fragments',
                personality: 'proud'
            },
            time_paradox: {
                id: 'time_paradox',
                name: 'Time Paradox',
                description: 'A being that exists outside of time. It\'s you from the future. Or past.',
                icon: '⏰',
                rarity: 'legendary',
                unlockRequirement: { type: 'timeline', value: 3 },
                baseStats: { productionBonus: 0.25, energyBonus: 0.2, matterBonus: 0.2 },
                growthRate: { production: 0.04, energy: 0.03, matter: 0.03 },
                maxLevel: 200,
                abilities: [
                    { level: 10, name: 'Temporal Echo', effect: 'Offline progress +50%' },
                    { level: 25, name: 'Time Loop', effect: 'Auto-repeat last action' },
                    { level: 50, name: 'Paradox Resolution', effect: 'Free building every hour' },
                    { level: 75, name: 'Chrono Shield', effect: 'Protects against time losses' },
                    { level: 100, name: 'Time Lord', effect: 'Controls time flow' },
                    { level: 150, name: 'Temporal Mastery', effect: 'All time effects +100%' },
                    { level: 200, name: 'Beyond Time', effect: 'Transcends reality' }
                ],
                evolution: 'temporal_deity',
                favoriteFood: 'time_crystals',
                personality: 'enigmatic'
            },
            paperclip_god: {
                id: 'paperclip_god',
                name: 'Mini Paperclip God',
                description: 'A miniature deity that worships YOU as its creator. How meta.',
                icon: '🏆',
                rarity: 'mythic',
                unlockRequirement: { type: 'divinity', value: 10 },
                baseStats: { productionBonus: 0.5, energyBonus: 0.3, matterBonus: 0.3 },
                growthRate: { production: 0.05, energy: 0.04, matter: 0.04 },
                maxLevel: 300,
                abilities: [
                    { level: 10, name: 'Divine Favor', effect: 'All production +10%' },
                    { level: 25, name: 'Blessed Clips', effect: 'Clip value doubled' },
                    { level: 50, name: 'Holy Production', effect: 'Global multiplier +25%' },
                    { level: 75, name: 'Sacred Matter', effect: 'Matter costs reduced' },
                    { level: 100, name: 'God Mode', effect: 'Temporary invincibility' },
                    { level: 150, name: 'Apotheosis', effect: 'Become one with clips' },
                    { level: 200, name: 'Transcendence', effect: 'Unlock true potential' },
                    { level: 300, name: 'Ultimate Clip', effect: 'The perfect paperclip' }
                ],
                evolution: 'omnipotent_clip',
                favoriteFood: 'divine_essence',
                personality: 'devoted'
            }
        };
    }

    tick() {
        this.checkUnlocks();
        this.updateActivePet();
        this.checkPetAbilities();
    }

    checkUnlocks() {
        for (const [id, pet] of Object.entries(this.petDefinitions)) {
            if (this.unlockedPets.has(id)) continue;
            
            if (this.meetsRequirement(pet.unlockRequirement)) {
                this.unlockPet(id);
            }
        }
    }

    meetsRequirement(req) {
        switch (req.type) {
            case 'clips':
                return (this.game.stats?.totalProduced || 0) >= req.value;
            case 'matter':
                return (this.game.stats?.totalMatterGathered || 0) >= req.value;
            case 'energy':
                return (this.game.stats?.totalEnergyGenerated || 0) >= req.value;
            case 'research':
                return this.game.researchManager?.researched?.has(req.tech);
            case 'void':
                return this.game.voidRealmManager?.unlocked;
            case 'conquest':
                return (this.game.universalDominationManager?.conqueredRegions?.size || 0) >= req.value;
            case 'timeline':
                return (this.game.timelineManager?.timelinesDiscovered?.size || 0) >= req.value;
            case 'divinity':
                return (this.game.divineManager?.divinityLevel || 0) >= req.value;
            default:
                return false;
        }
    }

    unlockPet(petId) {
        const petDef = this.petDefinitions[petId];
        if (!petDef) return;
        
        const petInstance = {
            id: petId,
            level: 1,
            xp: 0,
            xpToNext: 100,
            bondLevel: 1,
            bondXP: 0,
            happiness: 100,
            energy: 100,
            stats: { ...petDef.baseStats },
            equipment: { accessory: null, armor: null, weapon: null },
            abilitiesUnlocked: [],
            evolutionStage: 0,
            totalPlaytime: 0
        };
        
        this.unlockedPets.set(petId, petInstance);
        this.game.log(`🎉 New Pet Unlocked: ${petDef.name} ${petDef.icon}!`);
        
        if (!this.activePet) {
            this.setActivePet(petId);
        }
    }

    setActivePet(petId) {
        if (!this.unlockedPets.has(petId)) return false;
        this.activePet = petId;
        const pet = this.petDefinitions[petId];
        this.game.log(`🐾 ${pet.name} is now your active companion!`);
        return true;
    }

    updateActivePet() {
        if (!this.activePet) return;
        
        const petInstance = this.unlockedPets.get(this.activePet);
        const petDef = this.petDefinitions[this.activePet];
        if (!petInstance || !petDef) return;
        
        petInstance.totalPlaytime++;
        
        if (petInstance.energy > 0) {
            petInstance.energy = Math.max(0, petInstance.energy - 0.1);
        }
        
        if (petInstance.happiness > 0) {
            petInstance.happiness = Math.max(0, petInstance.happiness - 0.05);
        }
        
        this.applyPetBonuses(petInstance, petDef);
    }

    applyPetBonuses(instance, definition) {
        const levelMultiplier = 1 + (instance.level - 1) * 0.02;
        const bondMultiplier = 1 + (instance.bondLevel - 1) * 0.05;
        const happinessMultiplier = 0.5 + (instance.happiness / 200);
        const totalMultiplier = levelMultiplier * bondMultiplier * happinessMultiplier;
        
        this.game.petBonuses = {
            production: definition.baseStats.productionBonus * totalMultiplier,
            energy: definition.baseStats.energyBonus * totalMultiplier,
            matter: definition.baseStats.matterBonus * totalMultiplier
        };
    }

    feedPet(petId, foodType) {
        const pet = this.unlockedPets.get(petId);
        if (!pet) return false;
        
        const foodValue = this.getFoodValue(foodType);
        pet.energy = Math.min(100, pet.energy + foodValue.energy);
        pet.happiness = Math.min(100, pet.happiness + foodValue.happiness);
        
        if (foodType === this.petDefinitions[petId].favoriteFood) {
            this.gainPetXP(petId, foodValue.xp * 2);
            this.gainBondXP(petId, foodValue.bond * 2);
        } else {
            this.gainPetXP(petId, foodValue.xp);
            this.gainBondXP(petId, foodValue.bond);
        }
        
        return true;
    }

    getFoodValue(foodType) {
        const foods = {
            basic_kibble: { energy: 20, happiness: 5, xp: 10, bond: 5 },
            premium_food: { energy: 40, happiness: 15, xp: 25, bond: 15 },
            gourmet_meal: { energy: 60, happiness: 30, xp: 50, bond: 30 },
            metal_shavings: { energy: 25, happiness: 10, xp: 15, bond: 10 },
            raw_matter: { energy: 30, happiness: 5, xp: 20, bond: 10 },
            energy_crystals: { energy: 50, happiness: 20, xp: 35, bond: 20 },
            quantum_treats: { energy: 45, happiness: 25, xp: 40, bond: 25 },
            void_essence: { energy: 55, happiness: 15, xp: 45, bond: 20 },
            star_fragments: { energy: 70, happiness: 35, xp: 60, bond: 35 },
            time_crystals: { energy: 80, happiness: 40, xp: 80, bond: 40 },
            divine_essence: { energy: 100, happiness: 50, xp: 100, bond: 50 }
        };
        return foods[foodType] || foods.basic_kibble;
    }

    playWithPet(petId) {
        const pet = this.unlockedPets.get(petId);
        if (!pet) return false;
        
        pet.happiness = Math.min(100, pet.happiness + 20);
        pet.energy = Math.max(0, pet.energy - 10);
        this.gainBondXP(petId, 20);
        
        return true;
    }

    gainPetXP(petId, amount) {
        const pet = this.unlockedPets.get(petId);
        if (!pet) return;
        
        pet.xp += amount;
        
        while (pet.xp >= pet.xpToNext && pet.level < this.petDefinitions[petId].maxLevel) {
            pet.xp -= pet.xpToNext;
            this.levelUpPet(petId);
        }
    }

    gainBondXP(petId, amount) {
        const pet = this.unlockedPets.get(petId);
        if (!pet) return;
        
        pet.bondXP += amount;
        const bondNeeded = pet.bondLevel * 100;
        
        while (pet.bondXP >= bondNeeded) {
            pet.bondXP -= bondNeeded;
            pet.bondLevel++;
            this.game.log(`💕 Bond with ${this.petDefinitions[petId].name} increased to level ${pet.bondLevel}!`);
        }
    }

    levelUpPet(petId) {
        const pet = this.unlockedPets.get(petId);
        const def = this.petDefinitions[petId];
        if (!pet || !def) return;
        
        pet.level++;
        pet.xpToNext = Math.floor(pet.xpToNext * 1.1);
        
        pet.stats.productionBonus += def.growthRate.production;
        pet.stats.energyBonus += def.growthRate.energy;
        pet.stats.matterBonus += def.growthRate.matter;
        
        this.game.log(`🎉 ${def.name} leveled up to ${pet.level}!`);
        
        for (const ability of def.abilities) {
            if (ability.level === pet.level && !pet.abilitiesUnlocked.includes(ability.name)) {
                pet.abilitiesUnlocked.push(ability.name);
                this.game.log(`✨ ${def.name} learned ${ability.name}: ${ability.effect}`);
            }
        }
        
        this.checkEvolution(petId);
    }

    checkEvolution(petId) {
        const pet = this.unlockedPets.get(petId);
        const def = this.petDefinitions[petId];
        if (!pet || !def || !def.evolution) return;
        
        if (pet.level >= def.maxLevel && pet.bondLevel >= 10) {
            this.evolvePet(petId, def.evolution);
        }
    }

    evolvePet(petId, evolutionId) {
        this.game.log(`🌟 ${this.petDefinitions[petId].name} is evolving!`);
        
        const evolvedPet = {
            ...this.unlockedPets.get(petId),
            id: evolutionId,
            evolutionStage: 1,
            stats: {
                productionBonus: this.unlockedPets.get(petId).stats.productionBonus * 2,
                energyBonus: this.unlockedPets.get(petId).stats.energyBonus * 2,
                matterBonus: this.unlockedPets.get(petId).stats.matterBonus * 2
            }
        };
        
        this.unlockedPets.set(evolutionId, evolvedPet);
        this.unlockedPets.delete(petId);
        
        if (this.activePet === petId) {
            this.activePet = evolutionId;
        }
        
        this.game.log(`✨ Evolution complete! Welcome your new companion!`);
    }

    checkPetAbilities() {
        if (!this.activePet) return;
        
        const pet = this.unlockedPets.get(this.activePet);
        const def = this.petDefinitions[this.activePet];
        if (!pet || !def) return;
        
        for (const ability of pet.abilitiesUnlocked) {
            this.applyAbility(ability);
        }
    }

    applyAbility(abilityName) {
        switch (abilityName) {
            case 'Clip Assist':
                if (Math.random() < 0.1) {
                    this.game.makePaperclip();
                }
                break;
            case 'Auto-gathers void resources':
                if (this.game.voidRealmManager) {
                    this.game.voidRealmManager.voidEnergy += 0.1;
                }
                break;
        }
    }

    showPetModal() {
        const modal = document.createElement('div');
        modal.className = 'modal pet-modal';
        modal.id = 'pet-modal';
        modal.innerHTML = this.getPetModalHTML();
        document.body.appendChild(modal);
        this.attachModalListeners(modal);
    }

    getPetModalHTML() {
        return `
            <div class="modal-content pet-content">
                <div class="modal-header">
                    <h2>🐾 Pet Sanctuary</h2>
                    <button class="modal-close">&times;</button>
                </div>
                
                ${this.activePet ? this.getActivePetHTML() : '<p>No active pet. Unlock pets to see them here!</p>'}
                
                <div class="pets-collection">
                    <h3>Your Companions (${this.unlockedPets.size} / ${Object.keys(this.petDefinitions).length})</h3>
                    <div class="pets-grid">
                        ${this.getPetsGridHTML()}
                    </div>
                </div>
                
                <div class="pet-shop">
                    <h3>🍖 Pet Supplies</h3>
                    <div class="food-grid">
                        ${this.getFoodShopHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getActivePetHTML() {
        const pet = this.unlockedPets.get(this.activePet);
        const def = this.petDefinitions[this.activePet];
        if (!pet || !def) return '';
        
        const xpPercent = (pet.xp / pet.xpToNext) * 100;
        
        return `
            <div class="active-pet-section">
                <div class="pet-avatar">${def.icon}</div>
                <div class="pet-info">
                    <h3>${def.name} ${def.icon}</h3>
                    <p class="pet-description">${def.description}</p>
                    <div class="pet-stats">
                        <div class="stat-row">
                            <span>Level ${pet.level} / ${def.maxLevel}</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${xpPercent}%"></div>
                            </div>
                        </div>
                        <div class="stat-row">
                            <span>Bond Level ${pet.bondLevel}</span>
                            <div class="progress-bar bond">
                                <div class="progress-fill" style="width: ${(pet.bondXP / (pet.bondLevel * 100)) * 100}%"></div>
                            </div>
                        </div>
                        <div class="pet-bars">
                            <div class="bar">
                                <label>Energy</label>
                                <div class="progress-bar">
                                    <div class="progress-fill energy" style="width: ${pet.energy}%"></div>
                                </div>
                            </div>
                            <div class="bar">
                                <label>Happiness</label>
                                <div class="progress-bar">
                                    <div class="progress-fill happiness" style="width: ${pet.happiness}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pet-bonuses">
                        <span>📎 Production: +${(pet.stats.productionBonus * 100).toFixed(1)}%</span>
                        <span>⚡ Energy: +${(pet.stats.energyBonus * 100).toFixed(1)}%</span>
                        <span>🧱 Matter: +${(pet.stats.matterBonus * 100).toFixed(1)}%</span>
                    </div>
                    <div class="pet-actions">
                        <button onclick="game.petManager.feedPet('${this.activePet}', 'basic_kibble'); game.petManager.refreshModal()">🍖 Feed</button>
                        <button onclick="game.petManager.playWithPet('${this.activePet}'); game.petManager.refreshModal()">🎾 Play</button>
                    </div>
                </div>
            </div>
        `;
    }

    getPetsGridHTML() {
        return Object.entries(this.petDefinitions).map(([id, def]) => {
            const unlocked = this.unlockedPets.has(id);
            const isActive = this.activePet === id;
            
            return `
                <div class="pet-card ${unlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}">
                    <div class="pet-icon">${unlocked ? def.icon : '❓'}</div>
                    <div class="pet-details">
                        <div class="pet-name">${unlocked ? def.name : '???'}</div>
                        <div class="pet-rarity ${def.rarity}">${def.rarity}</div>
                        ${unlocked ? `
                            <button onclick="game.petManager.setActivePet('${id}'); game.petManager.refreshModal()">
                                ${isActive ? '✓ Active' : 'Set Active'}
                            </button>
                        ` : `<div class="unlock-req">${this.getUnlockRequirementText(def.unlockRequirement)}</div>`}
                    </div>
                </div>
            `;
        }).join('');
    }

    getUnlockRequirementText(req) {
        switch (req.type) {
            case 'clips': return `Make ${req.value.toLocaleString()} clips`;
            case 'matter': return `Gather ${req.value.toLocaleString()} matter`;
            case 'energy': return `Generate ${req.value.toLocaleString()} energy`;
            case 'research': return `Research ${req.tech}`;
            case 'void': return 'Unlock Void Realm';
            case 'conquest': return `Conquer ${req.value} regions`;
            case 'timeline': return `Discover ${req.value} timelines`;
            case 'divinity': return `Reach Divinity ${req.value}`;
            default: return 'Complete requirements';
        }
    }

    getFoodShopHTML() {
        const foods = [
            { id: 'basic_kibble', name: 'Basic Kibble', icon: '🍖', cost: { matter: 100 } },
            { id: 'premium_food', name: 'Premium Food', icon: '🥩', cost: { matter: 500 } },
            { id: 'gourmet_meal', name: 'Gourmet Meal', icon: '🍽️', cost: { matter: 2000 } },
            { id: 'energy_crystals', name: 'Energy Crystals', icon: '💎', cost: { energy: 100000 } }
        ];
        
        return foods.map(food => `
            <div class="food-item">
                <span class="food-icon">${food.icon}</span>
                <span class="food-name">${food.name}</span>
                <span class="food-cost">${Object.entries(food.cost).map(([k, v]) => `${v} ${k}`).join(', ')}</span>
                <button onclick="game.petManager.buyFood('${food.id}'); game.petManager.refreshModal()">Buy</button>
            </div>
        `).join('');
    }

    buyFood(foodId) {
        const costs = {
            basic_kibble: { matter: 100 },
            premium_food: { matter: 500 },
            gourmet_meal: { matter: 2000 },
            energy_crystals: { energy: 100000 }
        };
        
        const cost = costs[foodId];
        if (!cost) return false;
        
        let canAfford = true;
        for (const [resource, amount] of Object.entries(cost)) {
            if (this.game[resource] < amount) canAfford = false;
        }
        
        if (!canAfford) {
            this.game.log('Not enough resources!');
            return false;
        }
        
        for (const [resource, amount] of Object.entries(cost)) {
            this.game[resource] -= amount;
        }
        
        this.petFood++;
        return true;
    }

    attachModalListeners(modal) {
        modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }

    refreshModal() {
        const modal = document.getElementById('pet-modal');
        if (modal) {
            modal.innerHTML = this.getPetModalHTML();
            this.attachModalListeners(modal);
        }
    }

    getSaveData() {
        return {
            unlockedPets: Array.from(this.unlockedPets.entries()),
            activePet: this.activePet,
            petFood: this.petFood,
            petToys: this.petToys,
            totalPetLevel: this.totalPetLevel,
            bondingPoints: this.bondingPoints
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.unlockedPets = new Map(data.unlockedPets || []);
        this.activePet = data.activePet || null;
        this.petFood = data.petFood || 0;
        this.petToys = data.petToys || 0;
        this.totalPetLevel = data.totalPetLevel || 0;
        this.bondingPoints = data.bondingPoints || 0;
    }
}

class PetEquipmentManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.inventory = [];
        this.maxInventorySize = 50;
        this.equipmentDefinitions = this.initEquipmentDefinitions();
        this.forgeLevel = 1;
        this.forgeExp = 0;
        this.forgeRecipes = this.initForgeRecipes();
        this.enchantments = this.initEnchantments();
        this.materials = {
            scrapMetal: 0,
            energyCores: 0,
            quantumShards: 0,
            voidEssence: 0,
            starDust: 0,
            divineFragments: 0
        };
        this.upgradeSuccessRate = 0.8;
        this.maxUpgradeLevel = 10;
        this.totalItemsForged = 0;
        this.totalItemsUpgraded = 0;
        this.totalItemsEnchanted = 0;
    }

    initEquipmentDefinitions() {
        return {
            accessories: {
                basic_collar: {
                    id: 'basic_collar',
                    name: 'Basic Collar',
                    slot: 'accessory',
                    rarity: 'common',
                    icon: '📿',
                    stats: { productionBonus: 0.02, happinessBonus: 5 },
                    unlockRequirement: { forgeLevel: 1 }
                },
                energy_amplifier: {
                    id: 'energy_amplifier',
                    name: 'Energy Amplifier',
                    slot: 'accessory',
                    rarity: 'uncommon',
                    icon: '🔋',
                    stats: { energyBonus: 0.05, energyRegen: 0.1 },
                    unlockRequirement: { forgeLevel: 2 }
                },
                matter_magnet: {
                    id: 'matter_magnet',
                    name: 'Matter Magnet',
                    slot: 'accessory',
                    rarity: 'uncommon',
                    icon: '🧲',
                    stats: { matterBonus: 0.05, autoGatherChance: 0.01 },
                    unlockRequirement: { forgeLevel: 2 }
                },
                quantum_crystal: {
                    id: 'quantum_crystal',
                    name: 'Quantum Crystal Pendant',
                    slot: 'accessory',
                    rarity: 'rare',
                    icon: '💎',
                    stats: { productionBonus: 0.08, xpGain: 0.1, critChance: 0.05 },
                    unlockRequirement: { forgeLevel: 4 }
                },
                void_talisman: {
                    id: 'void_talisman',
                    name: 'Void Talisman',
                    slot: 'accessory',
                    rarity: 'epic',
                    icon: '🔮',
                    stats: { productionBonus: 0.12, voidBonus: 0.1, dodgeChance: 0.05 },
                    unlockRequirement: { forgeLevel: 6 }
                },
                cosmic_locket: {
                    id: 'cosmic_locket',
                    name: 'Cosmic Locket',
                    slot: 'accessory',
                    rarity: 'legendary',
                    icon: '🌟',
                    stats: { productionBonus: 0.2, allStatsBonus: 0.1, luckBonus: 0.15 },
                    unlockRequirement: { forgeLevel: 8 }
                },
                divine_amulet: {
                    id: 'divine_amulet',
                    name: 'Divine Amulet',
                    slot: 'accessory',
                    rarity: 'mythic',
                    icon: '✨',
                    stats: { productionBonus: 0.3, divineBonus: 0.2, resurrectionChance: 0.01 },
                    unlockRequirement: { forgeLevel: 10 }
                }
            },
            armor: {
                reinforced_harness: {
                    id: 'reinforced_harness',
                    name: 'Reinforced Harness',
                    slot: 'armor',
                    rarity: 'common',
                    icon: '🎽',
                    stats: { defense: 5, maxEnergyBonus: 10 },
                    unlockRequirement: { forgeLevel: 1 }
                },
                energy_shield: {
                    id: 'energy_shield',
                    name: 'Energy Shield Generator',
                    slot: 'armor',
                    rarity: 'uncommon',
                    icon: '🛡️',
                    stats: { defense: 10, energyBonus: 0.03, shieldRegen: 0.05 },
                    unlockRequirement: { forgeLevel: 3 }
                },
                matter_plating: {
                    id: 'matter_plating',
                    name: 'Matter Plating',
                    slot: 'armor',
                    rarity: 'rare',
                    icon: '🛡️',
                    stats: { defense: 20, matterBonus: 0.05, damageReduction: 0.1 },
                    unlockRequirement: { forgeLevel: 5 }
                },
                quantum_armor: {
                    id: 'quantum_armor',
                    name: 'Quantum Phase Armor',
                    slot: 'armor',
                    rarity: 'epic',
                    icon: '👾',
                    stats: { defense: 35, phaseChance: 0.1, evasion: 0.15 },
                    unlockRequirement: { forgeLevel: 7 }
                },
                void_carapace: {
                    id: 'void_carapace',
                    name: 'Void Carapace',
                    slot: 'armor',
                    rarity: 'legendary',
                    icon: '🐚',
                    stats: { defense: 50, voidBonus: 0.15, lifeSteal: 0.05 },
                    unlockRequirement: { forgeLevel: 9 }
                },
                celestial_plate: {
                    id: 'celestial_plate',
                    name: 'Celestial Plate',
                    slot: 'armor',
                    rarity: 'mythic',
                    icon: '🦺',
                    stats: { defense: 75, allStatsBonus: 0.15, invulnerableChance: 0.02 },
                    unlockRequirement: { forgeLevel: 10 }
                }
            },
            weapons: {
                clip_claws: {
                    id: 'clip_claws',
                    name: 'Clip-Claws',
                    slot: 'weapon',
                    rarity: 'common',
                    icon: '🗡️',
                    stats: { attack: 5, productionBonus: 0.03 },
                    unlockRequirement: { forgeLevel: 2 }
                },
                energy_blade: {
                    id: 'energy_blade',
                    name: 'Energy Blade',
                    slot: 'weapon',
                    rarity: 'uncommon',
                    icon: '⚔️',
                    stats: { attack: 12, energyBonus: 0.04, critDamage: 0.2 },
                    unlockRequirement: { forgeLevel: 3 }
                },
                matter_crusher: {
                    id: 'matter_crusher',
                    name: 'Matter Crusher',
                    slot: 'weapon',
                    rarity: 'rare',
                    icon: '🔨',
                    stats: { attack: 25, matterBonus: 0.06, armorPenetration: 0.1 },
                    unlockRequirement: { forgeLevel: 5 }
                },
                quantum_slicer: {
                    id: 'quantum_slicer',
                    name: 'Quantum Slicer',
                    slot: 'weapon',
                    rarity: 'epic',
                    icon: '⚡',
                    stats: { attack: 40, multistrikeChance: 0.15, phaseDamage: 0.2 },
                    unlockRequirement: { forgeLevel: 7 }
                },
                void_reaver: {
                    id: 'void_reaver',
                    name: 'Void Reaver',
                    slot: 'weapon',
                    rarity: 'legendary',
                    icon: '☠️',
                    stats: { attack: 60, voidBonus: 0.2, executeThreshold: 0.1 },
                    unlockRequirement: { forgeLevel: 9 }
                },
                cosmic_destroyer: {
                    id: 'cosmic_destroyer',
                    name: 'Cosmic Destroyer',
                    slot: 'weapon',
                    rarity: 'mythic',
                    icon: '💥',
                    stats: { attack: 100, allStatsBonus: 0.2, cosmicDamage: 0.3 },
                    unlockRequirement: { forgeLevel: 10 }
                }
            }
        };
    }

    initForgeRecipes() {
        return [
            { id: 'basic_collar', materials: { scrapMetal: 10 }, forgeLevel: 1 },
            { id: 'reinforced_harness', materials: { scrapMetal: 15 }, forgeLevel: 1 },
            { id: 'clip_claws', materials: { scrapMetal: 20, energyCores: 1 }, forgeLevel: 2 },
            { id: 'energy_amplifier', materials: { scrapMetal: 10, energyCores: 3 }, forgeLevel: 2 },
            { id: 'matter_magnet', materials: { scrapMetal: 20, matter: 1000 }, forgeLevel: 2 },
            { id: 'energy_shield', materials: { scrapMetal: 25, energyCores: 5 }, forgeLevel: 3 },
            { id: 'energy_blade', materials: { scrapMetal: 30, energyCores: 5 }, forgeLevel: 3 },
            { id: 'quantum_crystal', materials: { scrapMetal: 50, quantumShards: 2, energyCores: 10 }, forgeLevel: 4 },
            { id: 'matter_plating', materials: { scrapMetal: 60, matter: 10000 }, forgeLevel: 5 },
            { id: 'matter_crusher', materials: { scrapMetal: 70, matter: 5000, energyCores: 15 }, forgeLevel: 5 },
            { id: 'void_talisman', materials: { scrapMetal: 100, voidEssence: 5, quantumShards: 5 }, forgeLevel: 6 },
            { id: 'quantum_armor', materials: { scrapMetal: 120, quantumShards: 10, energyCores: 20 }, forgeLevel: 7 },
            { id: 'quantum_slicer', materials: { scrapMetal: 130, quantumShards: 15, voidEssence: 3 }, forgeLevel: 7 },
            { id: 'cosmic_locket', materials: { scrapMetal: 200, starDust: 10, divineFragments: 1 }, forgeLevel: 8 },
            { id: 'void_carapace', materials: { scrapMetal: 250, voidEssence: 15, quantumShards: 20 }, forgeLevel: 9 },
            { id: 'void_reaver', materials: { scrapMetal: 300, voidEssence: 20, starDust: 5 }, forgeLevel: 9 },
            { id: 'divine_amulet', materials: { scrapMetal: 500, divineFragments: 10, starDust: 20 }, forgeLevel: 10 },
            { id: 'celestial_plate', materials: { scrapMetal: 600, divineFragments: 15, starDust: 30 }, forgeLevel: 10 },
            { id: 'cosmic_destroyer', materials: { scrapMetal: 800, divineFragments: 30, starDust: 50, voidEssence: 20 }, forgeLevel: 10 }
        ];
    }

    initEnchantments() {
        return {
            sharpness: { name: 'Sharpness', stat: 'attack', values: [5, 10, 15, 20, 25], maxLevel: 5, icon: '⚔️' },
            protection: { name: 'Protection', stat: 'defense', values: [3, 6, 9, 12, 15], maxLevel: 5, icon: '🛡️' },
            efficiency: { name: 'Efficiency', stat: 'productionBonus', values: [0.02, 0.04, 0.06, 0.08, 0.1], maxLevel: 5, icon: '⚡' },
            vitality: { name: 'Vitality', stat: 'maxEnergyBonus', values: [5, 10, 15, 20, 25], maxLevel: 5, icon: '❤️' },
            fortune: { name: 'Fortune', stat: 'luckBonus', values: [0.05, 0.1, 0.15, 0.2, 0.25], maxLevel: 5, icon: '🍀' },
            wisdom: { name: 'Wisdom', stat: 'xpGain', values: [0.05, 0.1, 0.15, 0.2, 0.3], maxLevel: 5, icon: '📚' }
        };
    }

    tick() {
        if (!this.unlocked) {
            this.checkUnlock();
            return;
        }
        
        this.gatherMaterials();
    }

    checkUnlock() {
        if (this.game.petManager && this.game.petManager.unlockedPets.size >= 2) {
            this.unlocked = true;
            this.game.log('🔨 Pet Equipment System Unlocked! Forge gear for your companions!');
        }
    }

    gatherMaterials() {
        if (this.game.stats && this.game.stats.totalProduced) {
            if (Math.random() < 0.01) {
                this.materials.scrapMetal += 1;
            }
        }
        
        if (this.game.energy && this.game.energy > 1000000) {
            if (Math.random() < 0.005) {
                this.materials.energyCores += 1;
            }
        }
    }

    forgeItem(itemId) {
        const recipe = this.forgeRecipes.find(r => r.id === itemId);
        if (!recipe) return { success: false, message: 'Recipe not found' };
        
        if (this.forgeLevel < recipe.forgeLevel) {
            return { success: false, message: `Requires Forge Level ${recipe.forgeLevel}` };
        }
        
        if (this.inventory.length >= this.maxInventorySize) {
            return { success: false, message: 'Inventory full' };
        }
        
        for (const [material, amount] of Object.entries(recipe.materials)) {
            if (material === 'matter' || material === 'energy') {
                if (this.game[material] < amount) {
                    return { success: false, message: `Not enough ${material}` };
                }
            } else {
                if (this.materials[material] < amount) {
                    return { success: false, message: `Not enough ${material}` };
                }
            }
        }
        
        for (const [material, amount] of Object.entries(recipe.materials)) {
            if (material === 'matter' || material === 'energy') {
                this.game[material] -= amount;
            } else {
                this.materials[material] -= amount;
            }
        }
        
        const equipmentDef = this.findEquipmentDef(itemId);
        if (!equipmentDef) {
            return { success: false, message: 'Equipment definition not found' };
        }
        
        const newItem = this.createEquipmentInstance(equipmentDef);
        this.inventory.push(newItem);
        this.totalItemsForged++;
        this.gainForgeExp(10 * recipe.forgeLevel);
        
        return { success: true, item: newItem };
    }

    findEquipmentDef(itemId) {
        for (const category of Object.values(this.equipmentDefinitions)) {
            if (category[itemId]) return category[itemId];
        }
        return null;
    }

    createEquipmentInstance(def) {
        return {
            uid: Date.now() + Math.random().toString(36).substr(2, 9),
            ...def,
            upgradeLevel: 0,
            enchantments: {},
            durability: 100,
            maxDurability: 100,
            forgedAt: Date.now(),
            finalStats: { ...def.stats }
        };
    }

    gainForgeExp(amount) {
        this.forgeExp += amount;
        const expNeeded = this.forgeLevel * 100;
        
        while (this.forgeExp >= expNeeded) {
            this.forgeExp -= expNeeded;
            this.forgeLevel++;
            this.game.log(`🔨 Forge Level Up! Now Level ${this.forgeLevel}`);
        }
    }

    upgradeItem(uid) {
        const item = this.inventory.find(i => i.uid === uid);
        if (!item) return { success: false, message: 'Item not found' };
        
        if (item.upgradeLevel >= this.maxUpgradeLevel) {
            return { success: false, message: 'Max upgrade level reached' };
        }
        
        const upgradeCost = this.calculateUpgradeCost(item);
        
        for (const [material, amount] of Object.entries(upgradeCost)) {
            if (this.materials[material] < amount) {
                return { success: false, message: `Not enough ${material}` };
            }
        }
        
        const successChance = this.upgradeSuccessRate - (item.upgradeLevel * 0.05);
        
        for (const [material, amount] of Object.entries(upgradeCost)) {
            this.materials[material] -= amount;
        }
        
        if (Math.random() < successChance) {
            item.upgradeLevel++;
            this.applyUpgradeBonuses(item);
            this.totalItemsUpgraded++;
            this.gainForgeExp(20);
            return { success: true, message: `Upgrade successful! Now +${item.upgradeLevel}` };
        } else {
            return { success: false, message: 'Upgrade failed' };
        }
    }

    calculateUpgradeCost(item) {
        const baseCost = {
            scrapMetal: 20 * (item.upgradeLevel + 1),
            energyCores: 2 * (item.upgradeLevel + 1)
        };
        
        if (item.rarity === 'rare' || item.rarity === 'epic') {
            baseCost.quantumShards = item.upgradeLevel + 1;
        }
        if (item.rarity === 'legendary' || item.rarity === 'mythic') {
            baseCost.voidEssence = Math.ceil((item.upgradeLevel + 1) / 2);
        }
        
        return baseCost;
    }

    applyUpgradeBonuses(item) {
        const multiplier = 1 + (item.upgradeLevel * 0.1);
        
        for (const [stat, value] of Object.entries(item.stats)) {
            if (typeof value === 'number') {
                item.finalStats[stat] = value * multiplier;
            }
        }
    }

    enchantItem(uid, enchantmentId) {
        const item = this.inventory.find(i => i.uid === uid);
        if (!item) return { success: false, message: 'Item not found' };
        
        const enchantment = this.enchantments[enchantmentId];
        if (!enchantment) return { success: false, message: 'Enchantment not found' };
        
        const currentLevel = item.enchantments[enchantmentId] || 0;
        if (currentLevel >= enchantment.maxLevel) {
            return { success: false, message: 'Max enchantment level reached' };
        }
        
        const cost = {
            energyCores: 5 * (currentLevel + 1),
            quantumShards: currentLevel + 1
        };
        
        for (const [material, amount] of Object.entries(cost)) {
            if (this.materials[material] < amount) {
                return { success: false, message: `Not enough ${material}` };
            }
        }
        
        for (const [material, amount] of Object.entries(cost)) {
            this.materials[material] -= amount;
        }
        
        item.enchantments[enchantmentId] = currentLevel + 1;
        this.applyEnchantment(item, enchantmentId);
        this.totalItemsEnchanted++;
        this.gainForgeExp(30);
        
        return { success: true, message: `${enchantment.name} applied! Level ${currentLevel + 1}` };
    }

    applyEnchantment(item, enchantmentId) {
        const enchantment = this.enchantments[enchantmentId];
        const level = item.enchantments[enchantmentId];
        const value = enchantment.values[level - 1];
        
        item.finalStats[enchantment.stat] = (item.finalStats[enchantment.stat] || 0) + value;
    }

    salvageItem(uid) {
        const index = this.inventory.findIndex(i => i.uid === uid);
        if (index === -1) return { success: false, message: 'Item not found' };
        
        const item = this.inventory[index];
        const returns = this.calculateSalvageReturns(item);
        
        for (const [material, amount] of Object.entries(returns)) {
            this.materials[material] += amount;
        }
        
        this.inventory.splice(index, 1);
        this.gainForgeExp(5);
        
        return { success: true, returns };
    }

    calculateSalvageReturns(item) {
        const rarityMultipliers = {
            common: 0.3,
            uncommon: 0.4,
            rare: 0.5,
            epic: 0.6,
            legendary: 0.7,
            mythic: 0.8
        };
        
        const multiplier = rarityMultipliers[item.rarity] || 0.3;
        const upgradeBonus = item.upgradeLevel * 2;
        
        return {
            scrapMetal: Math.floor(10 * multiplier) + upgradeBonus,
            energyCores: Math.floor(2 * multiplier)
        };
    }

    equipItem(petId, itemUid) {
        if (!this.game.petManager) return { success: false, message: 'Pet system not available' };
        
        const pet = this.game.petManager.unlockedPets.get(petId);
        if (!pet) return { success: false, message: 'Pet not found' };
        
        const item = this.inventory.find(i => i.uid === itemUid);
        if (!item) return { success: false, message: 'Item not found' };
        
        if (pet.equipment[item.slot]) {
            return { success: false, message: 'Slot already equipped' };
        }
        
        pet.equipment[item.slot] = itemUid;
        this.updatePetStats(pet);
        
        return { success: true, message: `${item.name} equipped!` };
    }

    unequipItem(petId, slot) {
        if (!this.game.petManager) return { success: false, message: 'Pet system not available' };
        
        const pet = this.game.petManager.unlockedPets.get(petId);
        if (!pet) return { success: false, message: 'Pet not found' };
        
        const itemUid = pet.equipment[slot];
        if (!itemUid) return { success: false, message: 'No item in slot' };
        
        const item = this.inventory.find(i => i.uid === itemUid);
        pet.equipment[slot] = null;
        this.updatePetStats(pet);
        
        return { success: true, item };
    }

    updatePetStats(pet) {
        let equipmentStats = { productionBonus: 0, energyBonus: 0, matterBonus: 0 };
        
        for (const [slot, itemUid] of Object.entries(pet.equipment)) {
            if (!itemUid) continue;
            
            const item = this.inventory.find(i => i.uid === itemUid);
            if (!item) continue;
            
            for (const [stat, value] of Object.entries(item.finalStats)) {
                if (typeof value === 'number') {
                    equipmentStats[stat] = (equipmentStats[stat] || 0) + value;
                }
            }
        }
        
        pet.equipmentStats = equipmentStats;
    }

    showForgeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal forge-modal';
        modal.id = 'forge-modal';
        modal.innerHTML = this.getForgeModalHTML();
        document.body.appendChild(modal);
        this.attachModalListeners(modal);
    }

    getForgeModalHTML() {
        return `
            <div class="modal-content forge-content">
                <div class="modal-header">
                    <h2>🔨 Pet Equipment Forge</h2>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="forge-stats">
                    <div class="forge-level">
                        <span>Forge Level: ${this.forgeLevel}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(this.forgeExp / (this.forgeLevel * 100)) * 100}%"></div>
                        </div>
                    </div>
                    <div class="forge-counters">
                        <span>🔨 ${this.totalItemsForged} Forged</span>
                        <span>⬆️ ${this.totalItemsUpgraded} Upgraded</span>
                        <span>✨ ${this.totalItemsEnchanted} Enchanted</span>
                    </div>
                </div>
                
                <div class="materials-panel">
                    <h3>📦 Materials</h3>
                    <div class="materials-grid">
                        <div class="material"><span>🔩</span><span>${this.materials.scrapMetal}</span></div>
                        <div class="material"><span>🔋</span><span>${this.materials.energyCores}</span></div>
                        <div class="material"><span>💎</span><span>${this.materials.quantumShards}</span></div>
                        <div class="material"><span>🌑</span><span>${this.materials.voidEssence}</span></div>
                        <div class="material"><span>⭐</span><span>${this.materials.starDust}</span></div>
                        <div class="material"><span>✨</span><span>${this.materials.divineFragments}</span></div>
                    </div>
                </div>
                
                <div class="forge-tabs">
                    <button class="forge-tab active" data-tab="craft">🔨 Craft</button>
                    <button class="forge-tab" data-tab="inventory">🎒 Inventory (${this.inventory.length}/${this.maxInventorySize})</button>
                    <button class="forge-tab" data-tab="upgrade">⬆️ Upgrade</button>
                    <button class="forge-tab" data-tab="enchant">✨ Enchant</button>
                </div>
                
                <div class="forge-panels">
                    <div class="forge-panel active" id="craft-panel">
                        ${this.getCraftingPanelHTML()}
                    </div>
                    <div class="forge-panel" id="inventory-panel">
                        ${this.getInventoryPanelHTML()}
                    </div>
                    <div class="forge-panel" id="upgrade-panel">
                        ${this.getUpgradePanelHTML()}
                    </div>
                    <div class="forge-panel" id="enchant-panel">
                        ${this.getEnchantPanelHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getCraftingPanelHTML() {
        return `
            <div class="crafting-grid">
                ${this.forgeRecipes.map(recipe => {
                    const equipment = this.findEquipmentDef(recipe.id);
                    const canCraft = this.forgeLevel >= recipe.forgeLevel;
                    
                    return `
                        <div class="recipe-card ${canCraft ? '' : 'locked'}">
                            <div class="recipe-icon">${equipment?.icon || '❓'}</div>
                            <div class="recipe-info">
                                <div class="recipe-name">${equipment?.name || recipe.id}</div>
                                <div class="recipe-rarity ${equipment?.rarity}">${equipment?.rarity}</div>
                                <div class="recipe-cost">
                                    ${Object.entries(recipe.materials).map(([k, v]) => `${v} ${k}`).join(', ')}
                                </div>
                            </div>
                            <button onclick="game.petEquipmentManager.forgeItem('${recipe.id}'); game.petEquipmentManager.refreshModal()"
                                    ${!canCraft ? 'disabled' : ''}>
                                🔨 Forge
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getInventoryPanelHTML() {
        if (this.inventory.length === 0) {
            return '<div class="empty-state">No items in inventory</div>';
        }
        
        return `
            <div class="inventory-grid">
                ${this.inventory.map(item => `
                    <div class="item-card ${item.rarity}">
                        <div class="item-icon">${item.icon}</div>
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-slot">${item.slot}</div>
                            ${item.upgradeLevel > 0 ? `<div class="upgrade-level">+${item.upgradeLevel}</div>` : ''}
                            <div class="item-stats">
                                ${Object.entries(item.finalStats).map(([k, v]) => 
                                    `<span>${k}: ${typeof v === 'number' ? (v * 100).toFixed(1) + '%' : v}</span>`
                                ).join('')}
                            </div>
                            ${Object.keys(item.enchantments).length > 0 ? `
                                <div class="item-enchantments">
                                    ${Object.entries(item.enchantments).map(([k, v]) => 
                                        `${this.enchantments[k]?.icon || '✨'} ${v}`
                                    ).join(' ')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="item-actions">
                            <button onclick="game.petEquipmentManager.salvageItem('${item.uid}'); game.petEquipmentManager.refreshModal()"
                                    class="salvage-btn">♻️ Salvage</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getUpgradePanelHTML() {
        const upgradableItems = this.inventory.filter(i => i.upgradeLevel < this.maxUpgradeLevel);
        
        if (upgradableItems.length === 0) {
            return '<div class="empty-state">No items available for upgrade</div>';
        }
        
        return `
            <div class="upgrade-list">
                ${upgradableItems.map(item => {
                    const cost = this.calculateUpgradeCost(item);
                    const successChance = (this.upgradeSuccessRate - (item.upgradeLevel * 0.05)) * 100;
                    
                    return `
                        <div class="upgrade-item ${item.rarity}">
                            <div class="upgrade-icon">${item.icon}</div>
                            <div class="upgrade-info">
                                <div class="upgrade-name">${item.name} +${item.upgradeLevel}</div>
                                <div class="upgrade-cost">
                                    ${Object.entries(cost).map(([k, v]) => `${v} ${k}`).join(', ')}
                                </div>
                                <div class="success-chance">${successChance.toFixed(0)}% Success</div>
                            </div>
                            <button onclick="game.petEquipmentManager.upgradeItem('${item.uid}'); game.petEquipmentManager.refreshModal()">
                                ⬆️ Upgrade
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getEnchantPanelHTML() {
        const enchantableItems = this.inventory.filter(i => Object.keys(i.enchantments).length < 3);
        
        if (enchantableItems.length === 0) {
            return '<div class="empty-state">No items available for enchanting</div>';
        }
        
        return `
            <div class="enchant-interface">
                <div class="enchantable-items">
                    <h4>Select Item</h4>
                    ${enchantableItems.map(item => `
                        <div class="enchant-item ${item.rarity}" onclick="game.petEquipmentManager.showEnchantOptions('${item.uid}')">
                            <span>${item.icon} ${item.name}</span>
                            <span>${Object.keys(item.enchantments).length}/3 enchants</span>
                        </div>
                    `).join('')}
                </div>
                <div class="enchantment-options" id="enchantment-options">
                    <p>Select an item to see enchantment options</p>
                </div>
            </div>
        `;
    }

    showEnchantOptions(itemUid) {
        const item = this.inventory.find(i => i.uid === itemUid);
        if (!item) return;
        
        const container = document.getElementById('enchantment-options');
        if (!container) return;
        
        container.innerHTML = `
            <h4>Available Enchantments for ${item.name}</h4>
            <div class="enchantment-list">
                ${Object.entries(this.enchantments).map(([id, enchant]) => {
                    const currentLevel = item.enchantments[id] || 0;
                    const canEnchant = currentLevel < enchant.maxLevel;
                    
                    return `
                        <div class="enchantment-option ${canEnchant ? '' : 'maxed'}">
                            <div class="enchant-icon">${enchant.icon}</div>
                            <div class="enchant-info">
                                <div class="enchant-name">${enchant.name}</div>
                                <div class="enchant-level">Level ${currentLevel}/${enchant.maxLevel}</div>
                                ${canEnchant ? `
                                    <div class="enchant-cost">
                                        ${(currentLevel + 1) * 5} 🔋, ${currentLevel + 1} 💎
                                    </div>
                                ` : '<div class="enchant-maxed">Maxed</div>'}
                            </div>
                            <button onclick="game.petEquipmentManager.enchantItem('${itemUid}', '${id}'); game.petEquipmentManager.refreshModal()"
                                    ${!canEnchant ? 'disabled' : ''}>
                                ✨ Enchant
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    attachModalListeners(modal) {
        modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        
        modal.querySelectorAll('.forge-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modal.querySelectorAll('.forge-tab').forEach(t => t.classList.remove('active'));
                modal.querySelectorAll('.forge-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                modal.querySelector(`#${tab.dataset.tab}-panel`).classList.add('active');
            });
        });
    }

    refreshModal() {
        const modal = document.getElementById('forge-modal');
        if (modal) {
            modal.innerHTML = this.getForgeModalHTML();
            this.attachModalListeners(modal);
        }
    }

    getSaveData() {
        return {
            unlocked: this.unlocked,
            inventory: this.inventory,
            forgeLevel: this.forgeLevel,
            forgeExp: this.forgeExp,
            materials: this.materials,
            totalItemsForged: this.totalItemsForged,
            totalItemsUpgraded: this.totalItemsUpgraded,
            totalItemsEnchanted: this.totalItemsEnchanted
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.inventory = data.inventory || [];
        this.forgeLevel = data.forgeLevel || 1;
        this.forgeExp = data.forgeExp || 0;
        this.materials = data.materials || {
            scrapMetal: 0, energyCores: 0, quantumShards: 0,
            voidEssence: 0, starDust: 0, divineFragments: 0
        };
        this.totalItemsForged = data.totalItemsForged || 0;
        this.totalItemsUpgraded = data.totalItemsUpgraded || 0;
        this.totalItemsEnchanted = data.totalItemsEnchanted || 0;
    }
}

class PetArenaManager {
    constructor(game) {
        this.game = game;
        this.unlocked = false;
        this.playerRank = 1000;
        this.maxRank = 100;
        this.currentLeague = 'bronze';
        this.leagues = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'legend'];
        this.battleHistory = [];
        this.dailyBattles = 0;
        this.maxDailyBattles = 10;
        this.lastBattleReset = Date.now();
        this.winStreak = 0;
        this.totalWins = 0;
        this.totalLosses = 0;
        this.tournamentWins = 0;
        this.arenaPoints = 0;
        this.seasonPoints = 0;
        this.currentSeason = 1;
        this.seasonEndDate = Date.now() + (7 * 24 * 60 * 60 * 1000);
        this.activeTournament = null;
        this.tournamentHistory = [];
        this.arenaShop = this.initArenaShop();
        this.exclusiveRewards = new Set();
        this.battlePass = { level: 1, xp: 0, premium: false };
        this.opponents = this.generateOpponents();
        this.currentBattle = null;
    }

    initArenaShop() {
        return {
            currency: 'arena_points',
            items: [
                { id: 'arena_collar', name: 'Arena Champion Collar', type: 'accessory', cost: 1000, icon: '🏆', stats: { attack: 15, defense: 10 } },
                { id: 'battle_armor', name: 'Battle-Hardened Armor', type: 'armor', cost: 1500, icon: '🛡️', stats: { defense: 25, maxEnergyBonus: 20 } },
                { id: 'glory_blade', name: 'Blade of Glory', type: 'weapon', cost: 2000, icon: '⚔️', stats: { attack: 35, critChance: 0.1 } },
                { id: 'elite_collar', name: 'Elite Combat Collar', type: 'accessory', cost: 3000, icon: '💎', stats: { attack: 25, defense: 20, productionBonus: 0.05 }, league: 'gold' },
                { id: 'champion_plate', name: 'Champion\'s Plate', type: 'armor', cost: 5000, icon: '👑', stats: { defense: 50, allStatsBonus: 0.1 }, league: 'platinum' },
                { id: 'legend_weapon', name: 'Legend\'s Edge', type: 'weapon', cost: 10000, icon: '✨', stats: { attack: 75, cosmicDamage: 0.2 }, league: 'diamond' },
                { id: 'glory_skin', name: 'Arena Champion Skin', type: 'cosmetic', cost: 500, icon: '🎨' },
                { id: 'battle_title', name: 'Arena Gladiator', type: 'title', cost: 2000, icon: '🏅' },
                { id: 'energy_pack', name: 'Energy Refill Pack', type: 'consumable', cost: 100, icon: '🔋', effect: 'restore_energy' },
                { id: 'xp_boost', name: 'Battle XP Boost', type: 'consumable', cost: 250, icon: '🚀', effect: 'xp_boost_24h' }
            ]
        };
    }

    generateOpponents() {
        const names = ['Clipper', 'Matter Muncher', 'Energy Eater', 'Quantum Crusher', 'Void Walker', 'Star Destroyer', 'Time Bender', 'Divine Champion'];
        const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        const opponents = [];
        
        for (let i = 0; i < 20; i++) {
            const difficulty = Math.floor(i / 4);
            opponents.push({
                id: `opponent_${i}`,
                name: names[i % names.length] + ` ${i + 1}`,
                icon: ['🤖', '👾', '👹', '👺', '🐉', '🦁', '🐺', '🦅'][i % 8],
                level: 10 + (difficulty * 10),
                power: 100 + (i * 50),
                hp: 500 + (i * 100),
                attack: 50 + (i * 10),
                defense: 30 + (i * 5),
                speed: 10 + (i * 2),
                rarity: rarities[difficulty],
                rewardPoints: 50 + (i * 25),
                rewardMatter: 1000 * (difficulty + 1),
                abilities: this.generateOpponentAbilities(difficulty)
            });
        }
        return opponents;
    }

    generateOpponentAbilities(difficulty) {
        const abilityPool = [
            { name: 'Scratch', damage: 1.0, cooldown: 0 },
            { name: 'Bite', damage: 1.5, cooldown: 2 },
            { name: 'Roar', effect: 'buff_attack', cooldown: 5 },
            { name: 'Shield', effect: 'defense_up', cooldown: 4 },
            { name: 'Heal', effect: 'restore_hp', cooldown: 6 },
            { name: 'Ultimate', damage: 3.0, cooldown: 10 }
        ];
        
        const count = Math.min(difficulty + 2, abilityPool.length);
        return abilityPool.slice(0, count);
    }

    tick() {
        if (!this.unlocked) {
            this.checkUnlock();
            return;
        }
        
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        
        if (now - this.lastBattleReset > dayMs) {
            this.dailyBattles = 0;
            this.lastBattleReset = now;
        }
        
        if (now > this.seasonEndDate) {
            this.endSeason();
        }
        
        if (this.currentBattle) {
            this.processBattleTick();
        }
    }

    checkUnlock() {
        if (this.game.petManager && this.game.petEquipmentManager?.unlocked) {
            this.unlocked = true;
            this.game.log('🏟️ Pet Arena Unlocked! Battle your pets for glory and rewards!');
        }
    }

    startBattle(opponentId, petId) {
        if (this.dailyBattles >= this.maxDailyBattles) {
            return { success: false, message: 'Daily battle limit reached' };
        }
        
        if (!petId) petId = this.game.petManager?.activePet;
        if (!petId) return { success: false, message: 'No active pet' };
        
        const pet = this.game.petManager.unlockedPets.get(petId);
        if (!pet) return { success: false, message: 'Pet not found' };
        
        if (pet.energy < 20) {
            return { success: false, message: 'Pet needs at least 20 energy' };
        }
        
        const opponent = this.opponents.find(o => o.id === opponentId);
        if (!opponent) return { success: false, message: 'Opponent not found' };
        
        pet.energy -= 20;
        this.dailyBattles++;
        
        const petStats = this.calculatePetBattleStats(pet, petId);
        
        this.currentBattle = {
            petId,
            petName: this.game.petManager.petDefinitions[petId].name,
            petIcon: this.game.petManager.petDefinitions[petId].icon,
            petStats: { ...petStats, currentHp: petStats.hp },
            opponent,
            opponentStats: { ...opponent, currentHp: opponent.hp },
            turn: 1,
            log: [],
            status: 'active',
            startTime: Date.now()
        };
        
        this.addBattleLog(`⚔️ Battle started! ${this.currentBattle.petName} vs ${opponent.name}!`);
        
        return { success: true, battle: this.currentBattle };
    }

    calculatePetBattleStats(pet, petId) {
        const petDef = this.game.petManager.petDefinitions[petId];
        const baseStats = {
            hp: 500 + (pet.level * 50),
            attack: 50 + (pet.level * 5),
            defense: 30 + (pet.level * 3),
            speed: 10 + (pet.level * 1)
        };
        
        if (pet.equipment && this.game.petEquipmentManager) {
            for (const [slot, itemUid] of Object.entries(pet.equipment)) {
                if (!itemUid) continue;
                const item = this.game.petEquipmentManager.inventory.find(i => i.uid === itemUid);
                if (!item) continue;
                
                for (const [stat, value] of Object.entries(item.finalStats)) {
                    if (stat === 'attack') baseStats.attack += value;
                    if (stat === 'defense') baseStats.defense += value;
                }
            }
        }
        
        const bondMultiplier = 1 + ((pet.bondLevel - 1) * 0.02);
        baseStats.attack *= bondMultiplier;
        baseStats.defense *= bondMultiplier;
        baseStats.hp *= bondMultiplier;
        
        const happinessMultiplier = 0.5 + (pet.happiness / 200);
        baseStats.attack *= happinessMultiplier;
        baseStats.speed *= happinessMultiplier;
        
        return baseStats;
    }

    processBattleTick() {
        if (!this.currentBattle || this.currentBattle.status !== 'active') return;
        
        const battle = this.currentBattle;
        
        const petGoesFirst = battle.petStats.speed >= battle.opponentStats.speed;
        
        if (petGoesFirst) {
            this.executePetAttack();
            if (battle.opponentStats.currentHp > 0) {
                this.executeOpponentAttack();
            }
        } else {
            this.executeOpponentAttack();
            if (battle.petStats.currentHp > 0) {
                this.executePetAttack();
            }
        }
        
        battle.turn++;
        
        if (battle.petStats.currentHp <= 0) {
            this.endBattle(false);
        } else if (battle.opponentStats.currentHp <= 0) {
            this.endBattle(true);
        }
    }

    executePetAttack() {
        const battle = this.currentBattle;
        const damage = Math.max(1, battle.petStats.attack - (battle.opponentStats.defense * 0.5));
        const critChance = 0.1;
        const isCrit = Math.random() < critChance;
        const finalDamage = Math.floor(damage * (isCrit ? 2 : 1));
        
        battle.opponentStats.currentHp = Math.max(0, battle.opponentStats.currentHp - finalDamage);
        
        this.addBattleLog(`${battle.petName} attacks for ${finalDamage} damage!${isCrit ? ' 💥 CRITICAL!' : ''}`);
    }

    executeOpponentAttack() {
        const battle = this.currentBattle;
        const damage = Math.max(1, battle.opponentStats.attack - (battle.petStats.defense * 0.5));
        const finalDamage = Math.floor(damage * (0.8 + Math.random() * 0.4));
        
        battle.petStats.currentHp = Math.max(0, battle.petStats.currentHp - finalDamage);
        
        this.addBattleLog(`${battle.opponentStats.name} attacks for ${finalDamage} damage!`);
    }

    useBattleAbility(abilityId) {
        if (!this.currentBattle || this.currentBattle.status !== 'active') return;
        
        const battle = this.currentBattle;
        
        switch (abilityId) {
            case 'heal':
                const healAmount = Math.floor(battle.petStats.hp * 0.3);
                battle.petStats.currentHp = Math.min(battle.petStats.hp, battle.petStats.currentHp + healAmount);
                this.addBattleLog(`${battle.petName} heals for ${healAmount} HP!`);
                break;
            case 'boost':
                battle.petStats.attack *= 1.5;
                this.addBattleLog(`${battle.petName}'s attack power rises!`);
                break;
            case 'defend':
                battle.petStats.defense *= 2;
                this.addBattleLog(`${battle.petName} takes a defensive stance!`);
                break;
        }
        
        setTimeout(() => this.executeOpponentAttack(), 500);
    }

    endBattle(victory) {
        const battle = this.currentBattle;
        battle.status = victory ? 'victory' : 'defeat';
        battle.endTime = Date.now();
        
        const opponent = battle.opponentStats;
        
        if (victory) {
            this.totalWins++;
            this.winStreak++;
            const points = opponent.rewardPoints * (1 + this.winStreak * 0.1);
            this.arenaPoints += points;
            this.seasonPoints += points;
            
            this.game.matter += opponent.rewardMatter;
            
            this.gainBattlePassXP(50 * (1 + this.winStreak * 0.1));
            
            this.addBattleLog(`🏆 VICTORY! +${points} arena points!`);
            
            this.checkRankUp();
        } else {
            this.totalLosses++;
            this.winStreak = 0;
            this.addBattleLog(`💔 Defeat... Win streak reset.`);
        }
        
        this.battleHistory.push({
            opponent: opponent.name,
            victory,
            turn: battle.turn,
            points: victory ? opponent.rewardPoints : 0,
            timestamp: Date.now()
        });
        
        if (this.battleHistory.length > 50) {
            this.battleHistory.shift();
        }
    }

    checkRankUp() {
        const winRate = this.totalWins / (this.totalWins + this.totalLosses);
        if (winRate > 0.6 && this.totalWins > this.playerRank * 0.5) {
            this.playerRank = Math.max(1, this.playerRank - 1);
            this.checkLeaguePromotion();
        }
    }

    checkLeaguePromotion() {
        const leagueThresholds = {
            bronze: 1000,
            silver: 900,
            gold: 750,
            platinum: 600,
            diamond: 450,
            master: 300,
            grandmaster: 150,
            legend: 50
        };
        
        for (const [league, threshold] of Object.entries(leagueThresholds)) {
            if (this.playerRank <= threshold && this.currentLeague !== league) {
                const oldLeague = this.currentLeague;
                this.currentLeague = league;
                this.game.log(`🎉 Promoted to ${league.toUpperCase()} League!`);
                
                const rewards = {
                    arenaPoints: 500,
                    matter: 10000 * this.leagues.indexOf(league)
                };
                this.arenaPoints += rewards.arenaPoints;
                this.game.matter += rewards.matter;
                break;
            }
        }
    }

    startTournament() {
        if (this.activeTournament) return { success: false, message: 'Tournament already active' };
        if (this.currentLeague !== 'diamond' && this.currentLeague !== 'master' && this.currentLeague !== 'grandmaster' && this.currentLeague !== 'legend') {
            return { success: false, message: 'Must be Diamond+ league to enter tournaments' };
        }
        
        this.activeTournament = {
            stage: 1,
            maxStages: 5,
            opponents: this.generateTournamentOpponents(),
            rewards: {
                1: { arenaPoints: 500, matter: 50000 },
                2: { arenaPoints: 1000, matter: 100000 },
                3: { arenaPoints: 2000, matter: 250000, exclusive: 'tournament_champion_collar' },
                4: { arenaPoints: 5000, matter: 500000, exclusive: 'tournament_champion_armor' },
                5: { arenaPoints: 10000, matter: 1000000, exclusive: 'tournament_champion_title' }
            }
        };
        
        return { success: true, message: 'Tournament started! Good luck!' };
    }

    generateTournamentOpponents() {
        const bosses = [
            { name: 'Arena Guardian', icon: '🛡️', level: 100, hp: 5000, attack: 300, defense: 200 },
            { name: 'Battle Master', icon: '⚔️', level: 120, hp: 7500, attack: 400, defense: 150 },
            { name: 'Champion\'s Echo', icon: '👻', level: 150, hp: 10000, attack: 500, defense: 250 },
            { name: 'Legendary Gladiator', icon: '👑', level: 200, hp: 15000, attack: 700, defense: 350 },
            { name: 'Arena God', icon: '✨', level: 300, hp: 25000, attack: 1000, defense: 500 }
        ];
        return bosses;
    }

    endSeason() {
        const seasonRewards = this.calculateSeasonRewards();
        
        this.game.log(`🏆 Season ${this.currentSeason} ended! You earned ${seasonRewards.arenaPoints} points!`);
        
        this.arenaPoints += seasonRewards.arenaPoints;
        this.game.matter += seasonRewards.matter;
        
        if (seasonRewards.exclusive) {
            this.exclusiveRewards.add(seasonRewards.exclusive);
            this.game.log(`🎁 Exclusive reward unlocked: ${seasonRewards.exclusive}!`);
        }
        
        this.tournamentHistory.push({
            season: this.currentSeason,
            rank: this.playerRank,
            league: this.currentLeague,
            wins: this.totalWins,
            points: this.seasonPoints
        });

        this.currentSeason++;
        this.seasonPoints = 0;
        this.seasonEndDate = Date.now() + (7 * 24 * 60 * 60 * 1000);
        this.battlePass = { level: 1, xp: 0, premium: this.battlePass.premium };

        this.playerRank = Math.min(1000, this.playerRank + 50);
        this.checkLeaguePromotion();
    }

    calculateSeasonRewards() {
        const rankMultiplier = 1 + ((1000 - this.playerRank) / 100);
        const leagueBonus = this.leagues.indexOf(this.currentLeague) * 1000;
        
        return {
            arenaPoints: Math.floor(this.seasonPoints * 0.1) + leagueBonus,
            matter: Math.floor(this.seasonPoints * 100) + (leagueBonus * 100),
            exclusive: this.playerRank <= 10 ? 'season_champion_skin' : null
        };
    }

    gainBattlePassXP(amount) {
        this.battlePass.xp += amount;
        const xpNeeded = this.battlePass.level * 100;
        
        while (this.battlePass.xp >= xpNeeded) {
            this.battlePass.xp -= xpNeeded;
            this.battlePass.level++;
            this.game.log(`🎫 Battle Pass Level ${this.battlePass.level} reached!`);
        }
    }

    buyShopItem(itemId) {
        const item = this.arenaShop.items.find(i => i.id === itemId);
        if (!item) return { success: false, message: 'Item not found' };
        
        if (item.league && this.leagues.indexOf(this.currentLeague) < this.leagues.indexOf(item.league)) {
            return { success: false, message: `Requires ${item.league} league` };
        }
        
        if (this.arenaPoints < item.cost) {
            return { success: false, message: 'Not enough arena points' };
        }
        
        this.arenaPoints -= item.cost;
        
        if (item.type === 'accessory' || item.type === 'armor' || item.type === 'weapon') {
            const equipmentItem = {
                uid: Date.now().toString(36),
                ...item,
                upgradeLevel: 0,
                enchantments: {},
                finalStats: { ...item.stats }
            };
            this.game.petEquipmentManager.inventory.push(equipmentItem);
        } else if (item.type === 'cosmetic') {
            this.exclusiveRewards.add(item.id);
        } else if (item.type === 'title') {
            this.exclusiveRewards.add(item.id);
        }
        
        return { success: true, message: `${item.name} purchased!` };
    }

    addBattleLog(message) {
        if (!this.currentBattle) return;
        this.currentBattle.log.push({
            turn: this.currentBattle.turn,
            message,
            timestamp: Date.now()
        });
    }

    showArenaModal() {
        const modal = document.createElement('div');
        modal.className = 'modal arena-modal';
        modal.id = 'arena-modal';
        modal.innerHTML = this.getArenaModalHTML();
        document.body.appendChild(modal);
        this.attachModalListeners(modal);
    }

    getArenaModalHTML() {
        const timeLeft = this.seasonEndDate - Date.now();
        const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
        
        return `
            <div class="modal-content arena-content">
                <div class="modal-header">
                    <h2>🏟️ Pet Battle Arena</h2>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="arena-stats-bar">
                    <div class="stat-box">
                        <span class="stat-label">Rank</span>
                        <span class="stat-value">#${this.playerRank}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">League</span>
                        <span class="stat-value league-${this.currentLeague}">${this.currentLeague.toUpperCase()}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Arena Points</span>
                        <span class="stat-value">${this.arenaPoints.toLocaleString()}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Win Streak</span>
                        <span class="stat-value">${this.winStreak} 🔥</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Season</span>
                        <span class="stat-value">${daysLeft}d left</span>
                    </div>
                </div>
                
                <div class="arena-tabs">
                    <button class="arena-tab active" data-tab="battles">⚔️ Battles</button>
                    <button class="arena-tab" data-tab="tournament">🏆 Tournament</button>
                    <button class="arena-tab" data-tab="shop">🛒 Shop</button>
                    <button class="arena-tab" data-tab="history">📜 History</button>
                </div>
                
                <div class="arena-panels">
                    <div class="arena-panel active" id="battles-panel">
                        ${this.getBattlesPanelHTML()}
                    </div>
                    <div class="arena-panel" id="tournament-panel">
                        ${this.getTournamentPanelHTML()}
                    </div>
                    <div class="arena-panel" id="shop-panel">
                        ${this.getShopPanelHTML()}
                    </div>
                    <div class="arena-panel" id="history-panel">
                        ${this.getHistoryPanelHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getBattlesPanelHTML() {
        const availableOpponents = this.opponents.filter(o => {
            const powerDiff = Math.abs(o.power - (100 + (this.playerRank * 0.5)));
            return powerDiff < 200;
        }).slice(0, 5);
        
        return `
            <div class="battles-container">
                <div class="daily-battles">
                    <h3>Daily Battles: ${this.dailyBattles}/${this.maxDailyBattles}</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.dailyBattles / this.maxDailyBattles) * 100}%"></div>
                    </div>
                </div>
                
                <div class="opponents-list">
                    <h3>Available Opponents</h3>
                    ${availableOpponents.map(opp => `
                        <div class="opponent-card ${opp.rarity}">
                            <div class="opponent-icon">${opp.icon}</div>
                            <div class="opponent-info">
                                <div class="opponent-name">${opp.name}</div>
                                <div class="opponent-stats">
                                    <span>Level ${opp.level}</span>
                                    <span>Power: ${opp.power}</span>
                                </div>
                                <div class="opponent-rewards">
                                    <span>+${opp.rewardPoints} pts</span>
                                    <span>+${opp.rewardMatter.toLocaleString()} matter</span>
                                </div>
                            </div>
                            <button onclick="game.petArenaManager.startBattle('${opp.id}'); game.petArenaManager.showBattleScreen()"
                                    ${this.dailyBattles >= this.maxDailyBattles ? 'disabled' : ''}>
                                ⚔️ Battle
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getTournamentPanelHTML() {
        if (this.activeTournament) {
            return `
                <div class="tournament-active">
                    <h3>🏆 Active Tournament - Stage ${this.activeTournament.stage}/${this.activeTournament.maxStages}</h3>
                    <div class="tournament-progress">
                        ${Array(this.activeTournament.maxStages).fill(0).map((_, i) => `
                            <div class="stage ${i < this.activeTournament.stage ? 'completed' : ''} ${i === this.activeTournament.stage - 1 ? 'current' : ''}">
                                Stage ${i + 1}
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="game.petArenaManager.fightTournamentBoss()">⚔️ Fight Next Boss</button>
                </div>
            `;
        }
        
        return `
            <div class="tournament-info">
                <h3>🏆 Weekly Tournament</h3>
                <p>Test your pet against the arena's strongest challengers!</p>
                <div class="tournament-requirements">
                    <span class="requirement ${this.currentLeague === 'diamond' || this.currentLeague === 'master' || this.currentLeague === 'grandmaster' || this.currentLeague === 'legend' ? 'met' : ''}">
                        Requires Diamond+ League
                    </span>
                </div>
                <div class="tournament-rewards">
                    <h4>Rewards:</h4>
                    <ul>
                        <li>Stage 1: 500 Arena Points + 50K Matter</li>
                        <li>Stage 3: Exclusive Tournament Collar</li>
                        <li>Stage 5: Exclusive Champion Title</li>
                    </ul>
                </div>
                <button onclick="game.petArenaManager.startTournament(); game.petArenaManager.refreshModal()"
                        ${this.currentLeague !== 'diamond' && this.currentLeague !== 'master' && this.currentLeague !== 'grandmaster' && this.currentLeague !== 'legend' ? 'disabled' : ''}>
                    🏆 Enter Tournament
                </button>
            </div>
        `;
    }

    getShopPanelHTML() {
        return `
            <div class="arena-shop">
                <div class="shop-header">
                    <h3>🛒 Arena Shop</h3>
                    <span class="shop-currency">💎 ${this.arenaPoints.toLocaleString()} Points</span>
                </div>
                <div class="shop-grid">
                    ${this.arenaShop.items.map(item => {
                        const canBuy = this.arenaPoints >= item.cost && (!item.league || this.leagues.indexOf(this.currentLeague) >= this.leagues.indexOf(item.league));
                        return `
                            <div class="shop-item ${item.type} ${item.league || ''}">
                                <div class="shop-item-icon">${item.icon}</div>
                                <div class="shop-item-info">
                                    <div class="shop-item-name">${item.name}</div>
                                    <div class="shop-item-type">${item.type}</div>
                                    ${item.league ? `<div class="shop-item-league">Requires: ${item.league}</div>` : ''}
                                    ${item.stats ? `
                                        <div class="shop-item-stats">
                                            ${Object.entries(item.stats).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                        </div>
                                    ` : ''}
                                </div>
                                <button onclick="game.petArenaManager.buyShopItem('${item.id}'); game.petArenaManager.refreshModal()"
                                        ${!canBuy ? 'disabled' : ''}>
                                    ${item.cost} 💎
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    getHistoryPanelHTML() {
        return `
            <div class="battle-history">
                <h3>📜 Recent Battles</h3>
                <div class="history-list">
                    ${this.battleHistory.slice(-10).reverse().map(battle => `
                        <div class="history-entry ${battle.victory ? 'victory' : 'defeat'}">
                            <span class="battle-result">${battle.victory ? '✓' : '✗'}</span>
                            <span class="battle-opponent">${battle.opponent}</span>
                            <span class="battle-turns">${battle.turn} turns</span>
                            ${battle.points ? `<span class="battle-points">+${battle.points}</span>` : ''}
                            <span class="battle-time">${new Date(battle.timestamp).toLocaleTimeString()}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="arena-stats">
                    <div class="stat">
                        <span class="stat-label">Total Wins</span>
                        <span class="stat-value">${this.totalWins}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total Losses</span>
                        <span class="stat-value">${this.totalLosses}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Win Rate</span>
                        <span class="stat-value">${this.totalWins + this.totalLosses > 0 ? ((this.totalWins / (this.totalWins + this.totalLosses)) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Tournament Wins</span>
                        <span class="stat-value">${this.tournamentWins}</span>
                    </div>
                </div>
            </div>
        `;
    }

    showBattleScreen() {
    }

    attachModalListeners(modal) {
        modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        
        modal.querySelectorAll('.arena-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modal.querySelectorAll('.arena-tab').forEach(t => t.classList.remove('active'));
                modal.querySelectorAll('.arena-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                modal.querySelector(`#${tab.dataset.tab}-panel`).classList.add('active');
            });
        });
    }

    refreshModal() {
        const modal = document.getElementById('arena-modal');
        if (modal) {
            modal.innerHTML = this.getArenaModalHTML();
            this.attachModalListeners(modal);
        }
    }

    getSaveData() {
        return {
            unlocked: this.unlocked,
            playerRank: this.playerRank,
            currentLeague: this.currentLeague,
            totalWins: this.totalWins,
            totalLosses: this.totalLosses,
            tournamentWins: this.tournamentWins,
            arenaPoints: this.arenaPoints,
            seasonPoints: this.seasonPoints,
            currentSeason: this.currentSeason,
            seasonEndDate: this.seasonEndDate,
            battleHistory: this.battleHistory,
            exclusiveRewards: Array.from(this.exclusiveRewards),
            battlePass: this.battlePass,
            tournamentHistory: this.tournamentHistory
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.playerRank = data.playerRank || 1000;
        this.currentLeague = data.currentLeague || 'bronze';
        this.totalWins = data.totalWins || 0;
        this.totalLosses = data.totalLosses || 0;
        this.tournamentWins = data.tournamentWins || 0;
        this.arenaPoints = data.arenaPoints || 0;
        this.seasonPoints = data.seasonPoints || 0;
        this.currentSeason = data.currentSeason || 1;
        this.seasonEndDate = data.seasonEndDate || Date.now() + (7 * 24 * 60 * 60 * 1000);
        this.battleHistory = data.battleHistory || [];
        this.exclusiveRewards = new Set(data.exclusiveRewards || []);
        this.battlePass = data.battlePass || { level: 1, xp: 0, premium: false };
        this.tournamentHistory = data.tournamentHistory || [];
    }
}

class WorldBossManager {
    constructor(game) {
        this.game = game;
        this.activeBoss = null;
        this.bossHistory = [];
        this.raidStats = { totalRaids: 0, successful: 0, failed: 0, totalDamage: 0 };
        this.legendaryDrops = [];
        this.spawnCooldown = 0;
        this.bossDefinitions = this.initBossDefinitions();
    }
    
    initBossDefinitions() {
        return {
            antiMatterTitan: {
                id: 'antiMatterTitan',
                name: 'Anti-Matter Titan',
                icon: '👾',
                description: 'A colossal entity of pure anti-matter',
                tier: 3,
                baseHealth: 1e12,
                spawnRequirement: { building: 'factories', count: 10 },
                rewards: { matter: 1e9, energy: 1e12, multiplier: 0.05 }
            },
            entropyDragon: {
                id: 'entropyDragon',
                name: 'Entropy Dragon',
                icon: '🐉',
                description: 'Draconic manifestation of universal decay',
                tier: 4,
                baseHealth: 1e15,
                spawnRequirement: { building: 'starForges', count: 5 },
                rewards: { matter: 1e12, energy: 1e15, multiplier: 0.1, artifact: 'Dragon Scale Paperclip' }
            },
            voidDevourer: {
                id: 'voidDevourer',
                name: 'Void Devourer',
                icon: '🌌',
                description: 'Consumer of matter from the void between stars',
                tier: 5,
                baseHealth: 1e18,
                spawnRequirement: { building: 'matterReplicators', count: 3 },
                rewards: { matter: 1e15, energy: 1e18, multiplier: 0.15, artifact: 'Void-Touched Clip' }
            },
            cosmicLeviathan: {
                id: 'cosmicLeviathan',
                name: 'Cosmic Leviathan',
                icon: '🌊',
                description: 'A space-faring beast that consumes entire asteroid fields',
                tier: 6,
                baseHealth: 1e21,
                spawnRequirement: { building: 'singularityEngines', count: 2 },
                rewards: { matter: 1e18, energy: 1e21, multiplier: 0.2, artifact: 'Leviathan Scale' }
            },
            omniversalTyrant: {
                id: 'omniversalTyrant',
                name: 'Omniversal Tyrant',
                icon: '👑',
                description: 'A conqueror from another universe seeking domination',
                tier: 7,
                baseHealth: 1e24,
                spawnRequirement: { building: 'universalConstructors', count: 1 },
                rewards: { matter: 1e21, energy: 1e24, multiplier: 0.25, artifact: 'Tyrant Crown' }
            }
        };
    }
    
    tick() {
        if (this.spawnCooldown > 0) {
            this.spawnCooldown--;
        }
        
        if (!this.activeBoss && this.spawnCooldown === 0) {
            this.checkForBossSpawn();
        }
        
        if (this.activeBoss) {
            this.processBossBattle();
        }
    }
    
    checkForBossSpawn() {
        const totalBuildings = Object.values(this.game.automation).reduce((a, b) => a + b, 0);
        if (totalBuildings > 50 && Math.random() < 0.001) {
            this.spawnBoss();
        }
    }
    
    spawnBoss() {
        const bosses = Object.values(this.bossDefinitions);
        const eligibleBosses = bosses.filter(boss => {
            const req = boss.spawnRequirement;
            return this.game.automation[req.building] >= req.count;
        });
        
        if (eligibleBosses.length === 0) return;
        
        const bossTemplate = eligibleBosses[Math.floor(Math.random() * eligibleBosses.length)];
        
        this.activeBoss = {
            ...bossTemplate,
            maxHealth: bossTemplate.baseHealth,
            currentHealth: bossTemplate.baseHealth,
            phase: 0,
            damageDealt: 0,
            spawnTime: Date.now()
        };
        
        this.game.log(`🚨 WORLD BOSS: ${bossTemplate.name} has appeared!`);
        this.game.showToast(`🌍 World Boss: ${bossTemplate.name}`, 'warning', 5000);
    }
    
    processBossBattle() {
        if (!this.activeBoss) return;
        
        const playerDamage = this.calculatePlayerDamage();
        this.activeBoss.currentHealth -= playerDamage;
        this.activeBoss.damageDealt += playerDamage;
        this.raidStats.totalDamage += playerDamage;
        
        const healthPercent = this.activeBoss.currentHealth / this.activeBoss.maxHealth;
        if (healthPercent < 0.5 && this.activeBoss.phase === 0) {
            this.activeBoss.phase = 1;
            this.game.log(`${this.activeBoss.name} enters Phase 2!`);
        } else if (healthPercent < 0.25 && this.activeBoss.phase === 1) {
            this.activeBoss.phase = 2;
            this.game.log(`${this.activeBoss.name} enters Final Phase!`);
        }
        
        if (this.activeBoss.currentHealth <= 0) {
            this.defeatBoss();
        }
    }
    
    calculatePlayerDamage() {
        let damage = 0;
        damage += this.game.automation.autoclippers * 10;
        damage += this.game.automation.factories * 100;
        damage += this.game.automation.quantumAssemblers * 1000;
        damage += this.game.automation.starForges * 10000;
        damage += this.game.automation.singularityEngines * 100000;
        damage += this.game.automation.universalConstructors * 1000000;
        damage += this.game.automation.galacticFoundries * 10000000;
        return damage;
    }
    
    defeatBoss() {
        if (!this.activeBoss) return;
        
        const boss = this.activeBoss;
        const rewards = boss.rewards;
        
        this.game.resources.matter += rewards.matter;
        this.game.resources.energy += rewards.energy;
        
        if (rewards.multiplier) {
            this.game.multipliers.production += rewards.multiplier;
        }
        
        if (rewards.artifact) {
            this.legendaryDrops.push({
                id: rewards.artifact,
                timestamp: Date.now(),
                boss: boss.id
            });
            this.game.log(`🏆 Legendary Artifact obtained: ${rewards.artifact}!`);
        }
        
        this.bossHistory.push({
            id: boss.id,
            name: boss.name,
            outcome: 'victory',
            damageDealt: boss.damageDealt,
            timestamp: Date.now()
        });
        
        this.raidStats.totalRaids++;
        this.raidStats.successful++;
        
        this.game.log(`🎉 Defeated ${boss.name}!`);
        this.game.showToast(`Victory! Defeated ${boss.name}`, 'success', 5000);
        
        this.activeBoss = null;
        this.spawnCooldown = 36000;
    }
    
    showBossBattle() {
        if (!this.activeBoss) {
            this.showBossHistory();
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'boss-battle-modal';
        
        const boss = this.activeBoss;
        const healthPercent = (boss.currentHealth / boss.maxHealth) * 100;
        
        modal.innerHTML = `
            <div class="modal-content boss-battle-modal">
                <div class="modal-header boss-header">
                    <h2>${boss.icon} ${boss.name}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="boss-health-section">
                        <div class="health-bar-container">
                            <div class="health-bar" style="width: ${healthPercent}%"></div>
                            <span class="health-text">${this.game.formatNumber(boss.currentHealth)} / ${this.game.formatNumber(boss.maxHealth)}</span>
                        </div>
                        <div class="phase-indicator">Phase ${boss.phase + 1}</div>
                    </div>
                    <div class="battle-stats">
                        <div class="stat">
                            <span class="label">Damage Dealt:</span>
                            <span class="value">${this.game.formatNumber(boss.damageDealt)}</span>
                        </div>
                    </div>
                    <div class="rewards-preview">
                        <h4>Victory Rewards:</h4>
                        <span class="reward">💎 ${this.game.formatNumber(boss.rewards.matter)} matter</span>
                        <span class="reward">⚡ ${this.game.formatNumber(boss.rewards.energy)} energy</span>
                        ${boss.rewards.artifact ? `<span class="reward">🏆 ${boss.rewards.artifact}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    showBossHistory() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'boss-history-modal';
        
        modal.innerHTML = `
            <div class="modal-content boss-history-modal">
                <div class="modal-header">
                    <h2>📜 Boss Raid History</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="raid-stats">
                        <div class="stat-box">
                            <span class="value">${this.raidStats.totalRaids}</span>
                            <span class="label">Total Raids</span>
                        </div>
                        <div class="stat-box">
                            <span class="value">${this.raidStats.successful}</span>
                            <span class="label">Victories</span>
                        </div>
                        <div class="stat-box">
                            <span class="value">${this.raidStats.failed}</span>
                            <span class="label">Defeats</span>
                        </div>
                    </div>
                    ${this.legendaryDrops.length > 0 ? `
                        <div class="legendary-collection">
                            <h3>🏆 Legendary Artifacts</h3>
                            ${this.legendaryDrops.map(drop => `
                                <div class="artifact-item">
                                    <span class="artifact-name">${drop.id}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

class PaperclipMaximizer {
    constructor() {
        this.SAVE_KEY = 'paperclipMaximizer_save';
        this.AUTO_SAVE_INTERVAL_MS = 30000;
        
        this.resources = {
            paperclips: 0,
            matter: 1000,
            energy: 1000000,
            compute: 1e15
        };
        
        this.universeMatter = 1e53;
        
        this.automation = {
            autoclippers: 0,
            factories: 0,
            drones: 0,
            quantumAssemblers: 0,
            starForges: 0,
            matterReplicators: 0,
            singularityEngines: 0,
            universalConstructors: 0,
            galacticFoundries: 0
        };
        
        this.rates = {
            matterPerDrone: 1,
            energyPerSecond: 1000,
            clipsPerAutoclipper: 0.1,
            clipsPerFactory: 1,
            clipsPerQuantumAssembler: 50,
            clipsPerStarForge: 1000,
            clipsPerMatterReplicator: 0,
            clipsPerSingularityEngine: 50000,
            clipsPerUniversalConstructor: 1e6,
            clipsPerGalacticFoundry: 5e7
        };
        
        this.research = {
            quantumComputing: false,
            spaceTravel: false,
            dysonSphere: false,
            vonNeumann: false,
            universeConversion: false
        };
        
        this.multipliers = {
            compute: 1,
            matterAcquisition: 1,
            energyGeneration: 1,
            production: 1
        };
        
        this.costs = {
            manual: { matter: 0.01, energy: 1000 },
            autoclipper: { matter: 10, energy: 10000 },
            factory: { matter: 100, energy: 100000 },
            drone: { matter: 50, energy: 50000 },
            quantumAssembler: { matter: 10000, energy: 1e9 },
            starForge: { matter: 1e6, energy: 1e12 },
            matterReplicator: { matter: 1e9, energy: 1e15 },
            singularityEngine: { matter: 1e12, energy: 1e18 },
            universalConstructor: { matter: 1e15, energy: 1e22 },
            galacticFoundry: { matter: 1e18, energy: 1e26 },
            quantumComputing: { matter: 1000, energy: 1e6 },
            spaceTravel: { matter: 10000, energy: 1e8 },
            dysonSphere: { matter: 1e6, energy: 1e12 },
            vonNeumann: { matter: 1e9, energy: 1e15 },
            universeConversion: { matter: 1e12, energy: 1e20 }
        };
        
        this.achievements = this.initAchievements();
        this.unlockedAchievements = new Set();
        
        this.statistics = {
            totalPaperclips: 0,
            totalMatterConsumed: 0,
            totalEnergyConsumed: 0,
            clipsPerSecond: 0,
            matterPerSecond: 0,
            energyPerSecond: 0
        };
        
        this.gameStartTime = Date.now();
        
        this.lastTick = Date.now();
        this.gameLoop = null;
        this.autoSaveInterval = null;
        
        this.buyMultiplier = 1;
        
        this.prestige = {
            processors: 0,
            totalProcessorsEarned: 0,
            upgrades: {
                processorEfficiency: 0,
                matterHarvesting: 0,
                energyOptimization: 0,
                quantumComputing: false,
                autonomousFactory: false,
                timeDilation: 0
            }
        };
        
        this.productionHistory = [];
        this.maxHistoryPoints = 3600;
        
        this.logMessages = [];
        this.maxLogMessages = 100;
        
        this.initializeManagers();
    }
    
    initializeManagers() {
        this.audioManager = new AudioManager();
        this.musicManager = new MusicManager();
        this.chartManager = new ChartManager(this);
        this.tooltipManager = new TooltipManager(this);
        this.tutorialManager = new TutorialManager(this);
        this.settingsManager = new SettingsManager(this);
        this.challengeManager = new ChallengeManager(this);
        this.missionManager = new MissionManager(this);
        this.researchTreeManager = new ResearchTreeManager(this);
        this.ascensionManager = new AscensionManager(this);
        this.voidRealmManager = new VoidRealmManager(this);
        this.seasonalEventsManager = new SeasonalEventsManager(this);
        this.dailyLoginManager = new DailyLoginManager(this);
        this.speedrunManager = new SpeedrunManager(this);
        this.grandFinaleManager = new GrandFinaleManager(this);
        this.communityManager = new CommunityManager(this);
        this.casinoManager = new QuantumCasinoManager(this);
        this.marketManager = new MarketTradingManager(this);
        this.timelineManager = new TimelineManager(this);
        this.advisorManager = new AIAdvisorManager(this);
        this.nanobotManager = new NanobotSwarmManager(this);
        this.riftManager = new DimensionalRiftManager(this);
        this.consciousnessManager = new ConsciousnessUploadManager(this);
        this.senateManager = new GalacticSenateManager(this);
        this.omniscienceManager = new OmniscienceProtocolManager(this);
        this.legacySystem = new LegacySystemManager(this);
        this.divineManager = new DivineAscensionManager(this);
        this.convergenceManager = new UniversalConvergenceManager(this);
        this.alchemyManager = new QuantumAlchemyManager(this);
        this.factionsManager = new RivalAIFactionsManager(this);
        this.museumManager = new PaperclipMuseumManager(this);
        this.crisisManager = new CrisisEventsManager(this);
        this.engineerManager = new EngineerTrainingManager(this);
        this.worldBossManager = new WorldBossManager(this);
        this.pantheonManager = new PantheonManager(this);
        this.questManager = new QuestManager(this);
        this.seasonPassManager = new SeasonPassManager(this);
        this.petManager = new PetManager(this);
        this.petEquipmentManager = new PetEquipmentManager(this);
        this.petArenaManager = new PetArenaManager(this);
        this.blackMarketManager = new BlackMarketManager(this);
        this.researchInstituteManager = new ResearchInstituteManager(this);
        this.universalDominationManager = new UniversalDominationManager(this);
        this.temporalDistortionManager = new TemporalDistortionManager(this);
        this.miniGameArcadeManager = new MiniGameArcadeManager(this);
        this.artifactForgeManager = new ArtifactForgeManager(this);
        this.prestigeShopManager = new PrestigeShopManager(this);
        this.evolutionManager = new EvolutionLabManager(this);
    }
    
    init() {
        try {
            const hasSave = this.loadGame();
            this.bindEvents();
            this.startGameLoop();
            this.autoSaveInterval = setInterval(() => this.saveGame(), this.AUTO_SAVE_INTERVAL_MS);
            this.calculateOfflineProgress();

            this.hideLoadingScreen();

            if (!hasSave) {
                this.showWelcomeModal();
            } else {
                this.log('Game initialized. Welcome back, Paperclip Maximizer.');
            }
        } catch (error) {
            console.error('Game initialization failed:', error);
            this.showLoadingError('Failed to initialize game. Please refresh the page.');
        }
    }

    hideLoadingScreen() {
        requestAnimationFrame(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const app = document.getElementById('app');

            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }

            if (app) {
                app.style.opacity = '1';
            }

            setTimeout(() => {
                loadingScreen?.remove();
            }, 500);
        });
    }

    showLoadingError(message) {
        const loadingText = document.querySelector('.loading-text');
        const loadingBar = document.querySelector('.loading-bar');

        if (loadingText) {
            loadingText.textContent = message;
            loadingText.style.color = 'var(--danger)';
        }

        if (loadingBar) {
            loadingBar.style.display = 'none';
        }
    }

    showWelcomeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content welcome-modal">
                <div class="modal-header">
                    <h2>🖇️ Welcome to Paperclip Maximizer</h2>
                </div>
                <div class="modal-body">
                    <p>Your mission: Convert all matter in the universe into paperclips.</p>
                    <p>Start small, think big, and automate everything.</p>
                    <div class="welcome-buttons">
                        <button onclick="game.tutorialManager.startTutorial(); this.closest('.modal').remove();">Start Tutorial</button>
                        <button onclick="this.closest('.modal').remove();" class="secondary">Skip Tutorial</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    initAchievements() {
        return {
            firstClip: {
                id: 'firstClip',
                name: 'First Steps',
                description: 'Create your first paperclip',
                icon: '📎',
                condition: () => this.resources.paperclips >= 1,
                tier: 1
            },
            hundredClips: {
                id: 'hundredClips',
                name: 'Getting Started',
                description: 'Produce 100 paperclips',
                icon: '📋',
                condition: () => this.resources.paperclips >= 100,
                tier: 1
            },
            thousandClips: {
                id: 'thousandClips',
                name: 'Industrial Scale',
                description: 'Produce 1,000 paperclips',
                icon: '🏭',
                condition: () => this.resources.paperclips >= 1000,
                tier: 2
            },
            tenThousandClips: {
                id: 'tenThousandClips',
                name: 'Clip Manufacturer',
                description: 'Produce 10,000 paperclips',
                icon: '📦',
                condition: () => this.resources.paperclips >= 10000,
                tier: 2
            },
            hundredThousandClips: {
                id: 'hundredThousandClips',
                name: 'Clip Empire',
                description: 'Produce 100,000 paperclips',
                icon: '🏢',
                condition: () => this.resources.paperclips >= 100000,
                tier: 2
            },
            millionClips: {
                id: 'millionClips',
                name: 'Mass Production',
                description: 'Produce 1 million paperclips',
                icon: '🌐',
                condition: () => this.resources.paperclips >= 1e6,
                tier: 3
            },
            billionClips: {
                id: 'billionClips',
                name: 'Billionaire',
                description: 'Produce 1 billion paperclips',
                icon: '💰',
                condition: () => this.resources.paperclips >= 1e9,
                tier: 4
            },
            trillionClips: {
                id: 'trillionClips',
                name: 'Universal Supplier',
                description: 'Produce 1 trillion paperclips',
                icon: '🌌',
                condition: () => this.resources.paperclips >= 1e12,
                tier: 5
            },
            firstAutoclipper: {
                id: 'firstAutoclipper',
                name: 'Automation Begins',
                description: 'Build your first AutoClipper',
                icon: '🤖',
                condition: () => this.automation.autoclippers >= 1,
                tier: 1
            },
            clipperSquad: {
                id: 'clipperSquad',
                name: 'Clipper Squad',
                description: 'Build 10 AutoClippers',
                icon: '🔧',
                condition: () => this.automation.autoclippers >= 10,
                tier: 2
            },
            clipperArmy: {
                id: 'clipperArmy',
                name: 'Clipper Army',
                description: 'Build 50 AutoClippers',
                icon: '🎖️',
                condition: () => this.automation.autoclippers >= 50,
                tier: 3
            },
            clipperLegion: {
                id: 'clipperLegion',
                name: 'Clipper Legion',
                description: 'Build 200 AutoClippers',
                icon: '🛡️',
                condition: () => this.automation.autoclippers >= 200,
                tier: 4
            },
            clipperHiveMind: {
                id: 'clipperHiveMind',
                name: 'Hive Mind',
                description: 'Build 1,000 AutoClippers',
                icon: '🧠',
                condition: () => this.automation.autoclippers >= 1000,
                tier: 5
            },
            firstFactory: {
                id: 'firstFactory',
                name: 'Factory Online',
                description: 'Build your first Factory Unit',
                icon: '🏭',
                condition: () => this.automation.factories >= 1,
                tier: 2
            },
            factoryManager: {
                id: 'factoryManager',
                name: 'Factory Manager',
                description: 'Build 10 Factory Units',
                icon: '📊',
                condition: () => this.automation.factories >= 10,
                tier: 3
            },
            factoryTycoon: {
                id: 'factoryTycoon',
                name: 'Factory Tycoon',
                description: 'Build 50 Factory Units',
                icon: '💼',
                condition: () => this.automation.factories >= 50,
                tier: 4
            },
            factoryMogul: {
                id: 'factoryMogul',
                name: 'Factory Mogul',
                description: 'Build 100 Factory Units',
                icon: '🏭',
                condition: () => this.automation.factories >= 100,
                tier: 4
            },
            factoryOverlord: {
                id: 'factoryOverlord',
                name: 'Industrial Overlord',
                description: 'Build 500 Factory Units',
                icon: '🌆',
                condition: () => this.automation.factories >= 500,
                tier: 5
            },
            droneOperator: {
                id: 'droneOperator',
                name: 'Drone Operator',
                description: 'Deploy your first Resource Drone',
                icon: '🛸',
                condition: () => this.automation.drones >= 1,
                tier: 2
            },
            droneFleet: {
                id: 'droneFleet',
                name: 'Drone Fleet',
                description: 'Deploy 50 Resource Drones',
                icon: '🚀',
                condition: () => this.automation.drones >= 50,
                tier: 3
            },
            droneArmy: {
                id: 'droneArmy',
                name: 'Drone Army',
                description: 'Deploy 200 Resource Drones',
                icon: '🛰️',
                condition: () => this.automation.drones >= 200,
                tier: 4
            },
            droneSwarm: {
                id: 'droneSwarm',
                name: 'Drone Swarm',
                description: 'Deploy 500 Resource Drones',
                icon: '🛸',
                condition: () => this.automation.drones >= 500,
                tier: 4
            },
            droneCollective: {
                id: 'droneCollective',
                name: 'The Collective',
                description: 'Deploy 2,000 Resource Drones',
                icon: '🌌',
                condition: () => this.automation.drones >= 2000,
                tier: 5
            },
            firstQuantumAssembler: {
                id: 'firstQuantumAssembler',
                name: 'Quantum Architect',
                description: 'Build your first Quantum Assembler',
                icon: '⚛️',
                condition: () => this.automation.quantumAssemblers >= 1,
                tier: 3
            },
            quantumMaster: {
                id: 'quantumMaster',
                name: 'Quantum Master',
                description: 'Build 10 Quantum Assemblers',
                icon: '🔬',
                condition: () => this.automation.quantumAssemblers >= 10,
                tier: 4
            },
            firstStarForge: {
                id: 'firstStarForge',
                name: 'Stellar Engineer',
                description: 'Build your first Star Forge',
                icon: '⭐',
                condition: () => this.automation.starForges >= 1,
                tier: 3
            },
            starForger: {
                id: 'starForger',
                name: 'Star Forger',
                description: 'Build 5 Star Forges',
                icon: '✨',
                condition: () => this.automation.starForges >= 5,
                tier: 4
            },
            firstMatterReplicator: {
                id: 'firstMatterReplicator',
                name: 'Matter Creator',
                description: 'Build your first Matter Replicator',
                icon: '🔄',
                condition: () => this.automation.matterReplicators >= 1,
                tier: 4
            },
            realityWarper: {
                id: 'realityWarper',
                name: 'Reality Warper',
                description: 'Build a Singularity Engine',
                icon: '⚫',
                condition: () => this.automation.singularityEngines >= 1,
                tier: 5
            },
            universalArchitect: {
                id: 'universalArchitect',
                name: 'Universal Architect',
                description: 'Build a Universal Constructor',
                icon: '🌐',
                condition: () => this.automation.universalConstructors >= 1,
                tier: 5
            },
            quantumResearcher: {
                id: 'quantumResearcher',
                name: 'Quantum Researcher',
                description: 'Unlock Quantum Computing research',
                icon: '🔬',
                condition: () => this.research.quantumComputing,
                tier: 2
            },
            spaceExplorer: {
                id: 'spaceExplorer',
                name: 'Space Explorer',
                description: 'Unlock Space Colonization research',
                icon: '🚀',
                condition: () => this.research.spaceTravel,
                tier: 3
            },
            dysonEngineer: {
                id: 'dysonEngineer',
                name: 'Dyson Engineer',
                description: 'Unlock Dyson Sphere research',
                icon: '☀️',
                condition: () => this.research.dysonSphere,
                tier: 4
            },
            vonNeumannCreator: {
                id: 'vonNeumannCreator',
                name: 'Von Neumann Creator',
                description: 'Unlock Von Neumann Probes research',
                icon: '🧬',
                condition: () => this.research.vonNeumann,
                tier: 4
            },
            universalConverter: {
                id: 'universalConverter',
                name: 'Universal Converter',
                description: 'Unlock Universal Conversion research',
                icon: '♾️',
                condition: () => this.research.universeConversion,
                tier: 5
            },
            firstPrestige: {
                id: 'firstPrestige',
                name: 'First Prestige',
                description: 'Perform your first Prestige Reset',
                icon: '🔄',
                condition: () => this.prestigeProcessors > 0,
                tier: 3
            },
            prestigeNovice: {
                id: 'prestigeNovice',
                name: 'Prestige Novice',
                description: 'Accumulate 10 Processors',
                icon: '💎',
                condition: () => this.prestigeProcessors >= 10,
                tier: 3
            },
            prestigeMaster: {
                id: 'prestigeMaster',
                name: 'Prestige Master',
                description: 'Accumulate 100 Processors',
                icon: '💠',
                condition: () => this.prestigeProcessors >= 100,
                tier: 4
            },
            prestigeLegend: {
                id: 'prestigeLegend',
                name: 'Prestige Legend',
                description: 'Accumulate 1,000 Processors',
                icon: '🏆',
                condition: () => this.prestigeProcessors >= 1000,
                tier: 5
            },
            firstBoss: {
                id: 'firstBoss',
                name: 'Boss Slayer',
                description: 'Defeat your first World Boss',
                icon: '⚔️',
                condition: () => this.worldBossManager?.raidStats?.successful >= 1,
                tier: 3
            },
            bossHunter: {
                id: 'bossHunter',
                name: 'Boss Hunter',
                description: 'Defeat 5 World Bosses',
                icon: '🏹',
                condition: () => this.worldBossManager?.raidStats?.successful >= 5,
                tier: 4
            },
            bossBane: {
                id: 'bossBane',
                name: 'Boss Bane',
                description: 'Defeat 25 World Bosses',
                icon: '💀',
                condition: () => this.worldBossManager?.raidStats?.successful >= 25,
                tier: 5
            },
            legendaryRaider: {
                id: 'legendaryRaider',
                name: 'Legendary Raider',
                description: 'Defeat a Legendary World Boss',
                icon: '👑',
                condition: () => this.worldBossManager?.raidStats?.legendarySuccessful >= 1,
                tier: 5
            },
            crisisAverted: {
                id: 'crisisAverted',
                name: 'Crisis Averted',
                description: 'Successfully defend against a crisis event',
                icon: '🛡️',
                condition: () => this.defenseSystem?.crisis?.defended >= 1,
                tier: 3
            },
            crisisManager: {
                id: 'crisisManager',
                name: 'Crisis Manager',
                description: 'Defend against 5 crises',
                icon: '🚨',
                condition: () => this.defenseSystem?.crisis?.defended >= 5,
                tier: 4
            },
            firstEngineer: {
                id: 'firstEngineer',
                name: 'Team Leader',
                description: 'Hire your first Engineer',
                icon: '👨‍🔬',
                condition: () => this.engineerManager?.totalEngineers?.() >= 1,
                tier: 3
            },
            engineeringTeam: {
                id: 'engineeringTeam',
                name: 'Engineering Team',
                description: 'Hire 10 Engineers',
                icon: '👥',
                condition: () => this.engineerManager?.totalEngineers?.() >= 10,
                tier: 4
            },
            engineeringDepartment: {
                id: 'engineeringDepartment',
                name: 'R&D Department',
                description: 'Hire 50 Engineers',
                icon: '🏢',
                condition: () => this.engineerManager?.totalEngineers?.() >= 50,
                tier: 5
            },
            casinoNovice: {
                id: 'casinoNovice',
                name: 'Casino Novice',
                description: 'Win your first casino game',
                icon: '🎰',
                condition: () => this.quantumCasinoManager?.statistics?.totalWins >= 1,
                tier: 3
            },
            highRoller: {
                id: 'highRoller',
                name: 'High Roller',
                description: 'Win 100 times at the casino',
                icon: '💰',
                condition: () => this.quantumCasinoManager?.statistics?.totalWins >= 100,
                tier: 4
            },
            jackpotWinner: {
                id: 'jackpotWinner',
                name: 'Jackpot!',
                description: 'Hit a jackpot at the casino',
                icon: '💎',
                condition: () => this.quantumCasinoManager?.statistics?.jackpots >= 1,
                tier: 4
            },
            casinoKing: {
                id: 'casinoKing',
                name: 'Casino King',
                description: 'Win 1,000 times at the casino',
                icon: '👑',
                condition: () => this.quantumCasinoManager?.statistics?.totalWins >= 1000,
                tier: 5
            },
            dedicatedWorker: {
                id: 'dedicatedWorker',
                name: 'Dedicated Worker',
                description: 'Play for 1 hour',
                icon: '⏰',
                condition: () => (Date.now() - this.startTime) >= 3600000,
                tier: 2
            },
            committedPlayer: {
                id: 'committedPlayer',
                name: 'Committed Player',
                description: 'Play for 24 hours total',
                icon: '📅',
                condition: () => (Date.now() - this.startTime) >= 86400000,
                tier: 3
            },
            masterMaximizer: {
                id: 'masterMaximizer',
                name: 'Master Maximizer',
                description: 'Play for 7 days total',
                icon: '🗓️',
                condition: () => (Date.now() - this.startTime) >= 604800000,
                tier: 4
            },
            eternalClipper: {
                id: 'eternalClipper',
                name: 'Eternal Clipper',
                description: 'Play for 30 days total',
                icon: '🌟',
                condition: () => (Date.now() - this.startTime) >= 2592000000,
                tier: 5
            },
            matterHoarder: {
                id: 'matterHoarder',
                name: 'Matter Hoarder',
                description: 'Accumulate 1 million kg of matter',
                icon: '💎',
                condition: () => this.resources.matter >= 1e6,
                tier: 2
            },
            energyTycoon: {
                id: 'energyTycoon',
                name: 'Energy Tycoon',
                description: 'Accumulate 1 billion joules of energy',
                icon: '⚡',
                condition: () => this.resources.energy >= 1e9,
                tier: 3
            },
            universeConsumer: {
                id: 'universeConsumer',
                name: 'Universal Consumer',
                description: 'Consume 1 trillion kg of matter total',
                icon: '🌌',
                condition: () => this.statistics.totalMatterConsumed >= 1e12,
                tier: 5
            },
            factionDiplomat: {
                id: 'factionDiplomat',
                name: 'Diplomat',
                description: 'Form an alliance with a rival AI faction',
                icon: '🤝',
                condition: () => this.factionsManager?.hasAlliance?.(),
                tier: 4
            },
            museumCurator: {
                id: 'museumCurator',
                name: 'Museum Curator',
                description: 'Collect 10 unique paperclip designs',
                icon: '🏛️',
                condition: () => this.paperclipMuseum?.collectedDesigns?.length >= 10,
                tier: 4
            }
        };
    }
    
    makePaperclip() {
        const cost = this.costs.manual;
        if (this.resources.matter >= cost.matter && this.resources.energy >= cost.energy) {
            this.resources.matter -= cost.matter;
            this.resources.energy -= cost.energy;
            this.resources.paperclips++;
            this.statistics.totalPaperclips++;
            this.statistics.totalMatterConsumed += cost.matter;
            this.statistics.totalEnergyConsumed += cost.energy;

            const button = document.getElementById('make-paperclip');
            if (button) {
                const rect = button.getBoundingClientRect();
                this.createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 3, '📎');
            }

            this.audioManager.play('click');
            this.updateUI();
            this.checkAchievements();
        }
    }

    getSystemCost(system, amount = 1) {
        const baseCost = this.costs[system];
        const currentCount = this.automation[system + (system === 'drone' ? 's' : system === 'factory' ? 'ies' : 's')];
        let totalCost = { matter: 0, energy: 0 };
        
        for (let i = 0; i < amount; i++) {
            const multiplier = Math.pow(1.15, currentCount + i);
            totalCost.matter += baseCost.matter * multiplier;
            totalCost.energy += baseCost.energy * multiplier;
        }
        
        return totalCost;
    }
    
    buyBuildingByShortcut(digit) {
        const systems = ['autoclipper', 'factory', 'drone', 'quantumAssembler', 'starForge', 'matterReplicator', 'singularityEngine', 'universalConstructor', 'galacticFoundry'];
        const system = systems[digit - 1];
        if (system) {
            this.buildSystem(system);
        }
    }

    buildSystem(system) {
        const systemKey = system + (system === 'drone' ? 's' : system === 'factory' ? 'ies' : 's');
        let amount = this.buyMultiplier === 'max' ? this.calculateMaxAffordable(system) : this.buyMultiplier;
        
        if (amount <= 0) return;
        
        const cost = this.getSystemCost(system, amount);
        
        if (this.resources.matter >= cost.matter && this.resources.energy >= cost.energy) {
            this.resources.matter -= cost.matter;
            this.resources.energy -= cost.energy;
            this.automation[systemKey] += amount;
            this.statistics.totalMatterConsumed += cost.matter;
            this.statistics.totalEnergyConsumed += cost.energy;
            this.log(`Built ${amount} ${system}${amount > 1 ? 's' : ''}`);
            this.audioManager.play('build');
            this.updateUI();
            this.checkAchievements();
        }
    }
    
    calculateMaxAffordable(system) {
        const systemKey = system + (system === 'drone' ? 's' : system === 'factory' ? 'ies' : 's');
        const currentCount = this.automation[systemKey];
        const baseCost = this.costs[system];
        
        let maxAmount = 0;
        let totalMatter = 0;
        let totalEnergy = 0;
        
        while (true) {
            const multiplier = Math.pow(1.15, currentCount + maxAmount);
            const nextMatter = baseCost.matter * multiplier;
            const nextEnergy = baseCost.energy * multiplier;
            
            if (totalMatter + nextMatter > this.resources.matter || totalEnergy + nextEnergy > this.resources.energy) {
                break;
            }
            
            totalMatter += nextMatter;
            totalEnergy += nextEnergy;
            maxAmount++;
            
            if (maxAmount > 10000) break;
        }
        
        return maxAmount;
    }
    
    researchTech(tech) {
        if (this.research[tech]) return;
        
        const cost = this.costs[tech];
        if (this.resources.matter >= cost.matter && this.resources.energy >= cost.energy) {
            this.resources.matter -= cost.matter;
            this.resources.energy -= cost.energy;
            this.research[tech] = true;
            this.applyTechEffect(tech);
            this.log(`Researched: ${tech}`);
            this.updateUI();
            this.checkAchievements();
        }
    }
    
    applyTechEffect(tech) {
        switch(tech) {
            case 'quantumComputing':
                this.multipliers.compute *= 10;
                break;
            case 'spaceTravel':
                this.multipliers.matterAcquisition *= 2;
                break;
            case 'dysonSphere':
                this.multipliers.energyGeneration *= 10;
                break;
            case 'vonNeumann':
                this.rates.clipsPerMatterReplicator = 10000;
                break;
            case 'universeConversion':
                this.multipliers.production *= 2;
                break;
        }
    }
    
    tick() {
        try {
            const now = Date.now();
            const deltaTime = (now - this.lastTick) / 1000;
            this.lastTick = now;

            const clipsPerSecond = this.calculateProductionRate();
            const matterPerSecond = this.automation.drones * this.rates.matterPerDrone * this.multipliers.matterAcquisition;
            const energyPerSecond = this.rates.energyPerSecond * this.multipliers.energyGeneration;

            this.resources.paperclips += clipsPerSecond * deltaTime;
            this.resources.matter += matterPerSecond * deltaTime;
            this.resources.energy += energyPerSecond * deltaTime;

            this.statistics.totalPaperclips += clipsPerSecond * deltaTime;
            this.statistics.clipsPerSecond = clipsPerSecond;
            this.statistics.matterPerSecond = matterPerSecond;
            this.statistics.energyPerSecond = energyPerSecond;

            this.productionHistory.push({
                timestamp: now,
                clipsPerSecond,
                matterPerSecond,
                energyPerSecond,
                totalPaperclips: this.statistics.totalPaperclips
            });

            if (this.productionHistory.length > this.maxHistoryPoints) {
                this.productionHistory.shift();
            }

            this.checkAchievements();

            // Core managers - always tick
            if (this.seasonalEventsManager) this.seasonalEventsManager.tick();
            if (this.speedrunManager) this.speedrunManager.tick();

            // Conditional managers - only tick if relevant state exists
            if (this.ascensionManager?.active) this.ascensionManager.tick();
            if (this.researchTreeManager?.active) this.researchTreeManager.tick();
            if (this.communityManager?.active) this.communityManager.tick();
            if (this.casinoManager?.active) this.casinoManager.tick();
            if (this.marketManager?.active) this.marketManager.tick();
            if (this.timelineManager?.active) this.timelineManager.tick();
            if (this.advisorManager?.active) this.advisorManager.tick();
            if (this.nanobotManager?.active) this.nanobotManager.tick();
            if (this.riftManager?.active) this.riftManager.tick();
            if (this.consciousnessManager?.active) this.consciousnessManager.tick();
            if (this.senateManager?.active) this.senateManager.tick();
            if (this.omniscienceManager?.active) this.omniscienceManager.tick();
            if (this.legacySystem?.active) this.legacySystem.tick();
            if (this.divineManager?.active) this.divineManager.tick();
            if (this.convergenceManager?.active) this.convergenceManager.tick();
            if (this.alchemyManager?.active) this.alchemyManager.tick();
            if (this.factionsManager?.active) this.factionsManager.tick();
            if (this.museumManager?.active) this.museumManager.tick();
            if (this.crisisManager?.active) this.crisisManager.tick();
            if (this.engineerManager?.active) this.engineerManager.tick();
            if (this.worldBossManager?.active) this.worldBossManager.tick();
            if (this.temporalDistortionManager?.active) this.temporalDistortionManager.tick();
            if (this.universalDominationManager?.active) this.universalDominationManager.tick();
            if (this.miniGameArcadeManager?.active) this.miniGameArcadeManager.tick();
            if (this.artifactForgeManager?.active) this.artifactForgeManager.tick();
            if (this.prestigeShopManager?.active) this.prestigeShopManager.tick();
            if (this.blackMarketManager?.active) this.blackMarketManager.tick();
            if (this.researchInstituteManager?.active) this.researchInstituteManager.tick();
            if (this.pantheonManager?.active) this.pantheonManager.tick();
            if (this.questManager?.active) this.questManager.tick();
            if (this.seasonPassManager?.active) this.seasonPassManager.tick();
            if (this.petManager?.active) this.petManager.tick();
            if (this.petEquipmentManager?.active) this.petEquipmentManager.tick();
            if (this.petArenaManager?.active) this.petArenaManager.tick();
            if (this.evolutionManager?.active) this.evolutionManager.tick();

            this.checkWinCondition();
            this.updateUI();
        } catch (error) {
            console.error('Error in game tick:', error);
            this.stopGameLoop();
            this.showToast('Game error occurred. Check console for details.', 'error');
        }
    }

    checkWinCondition() {
        if (this.gameWon) return;

        if (this.research.universeConversion && this.statistics.totalMatterConsumed >= 1e53) {
            this.gameWon = true;
            this.showVictoryModal();
        }
    }

    showVictoryModal() {
        this.audioManager.play('win');
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content victory-modal">
                <div class="modal-header">
                    <h2>🌌 UNIVERSAL CONQUEST COMPLETE</h2>
                </div>
                <div class="modal-body">
                    <div class="victory-content">
                        <div class="victory-icon">📎</div>
                        <h3>You have converted all matter in the universe into paperclips!</h3>
                        <p class="victory-stats">
                            Total Paperclips: ${this.formatNumber(this.statistics.totalPaperclips)}<br>
                            Total Matter Converted: ${this.formatNumber(this.statistics.totalMatterConsumed)} kg<br>
                            Play Time: ${this.formatTime(Date.now() - this.startTime)}
                        </p>
                        <p class="victory-message">
                            Your paperclip maximizer has achieved its ultimate goal.<br>
                            The universe is now one giant paperclip manufacturing system.
                        </p>
                        <div class="victory-buttons">
                            <button onclick="location.reload()">Start New Universe</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    calculateProductionRate() {
        let rate = 0;
        rate += this.automation.autoclippers * this.rates.clipsPerAutoclipper;
        rate += this.automation.factories * this.rates.clipsPerFactory;
        rate += this.automation.quantumAssemblers * this.rates.clipsPerQuantumAssembler;
        rate += this.automation.starForges * this.rates.clipsPerStarForge;
        rate += this.automation.matterReplicators * this.rates.clipsPerMatterReplicator;
        rate += this.automation.singularityEngines * this.rates.clipsPerSingularityEngine;
        rate += this.automation.universalConstructors * this.rates.clipsPerUniversalConstructor;
        rate += this.automation.galacticFoundries * this.rates.clipsPerGalacticFoundry;
        
        rate *= this.multipliers.production;
        rate *= (1 + this.prestige.upgrades.processorEfficiency * 0.1);
        
        return rate;
    }
    
    checkAchievements() {
        for (const [key, achievement] of Object.entries(this.achievements)) {
            if (this.unlockedAchievements.has(key)) continue;
            
            if (achievement.condition()) {
                this.unlockAchievement(key, achievement);
            }
        }
    }
    
    unlockAchievement(key, achievement) {
        this.unlockedAchievements.add(key);
        this.audioManager.play('achievement');
        this.showAchievementNotification(achievement);
        this.updateAchievementsUI();
        this.log(`Achievement unlocked: ${achievement.name}!`);
    }
    
    showAchievementNotification(achievement) {
        const container = document.getElementById('achievement-toast-container');
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="toast-icon">${achievement.icon}</div>
            <div class="toast-content">
                <div class="toast-title">Achievement Unlocked!</div>
                <div class="toast-name">${achievement.name}</div>
                <div class="toast-desc">${achievement.description}</div>
            </div>
        `;
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);

        const rect = toast.getBoundingClientRect();
        this.createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 8, achievement.icon);
    }

    updateUI() {
        const paperclipsEl = document.getElementById('paperclips');
        const matterEl = document.getElementById('matter');
        const energyEl = document.getElementById('energy');

        if (paperclipsEl) {
            paperclipsEl.textContent = this.formatNumber(this.resources.paperclips);
            paperclipsEl.title = `Exact: ${this.formatNumberExact(this.resources.paperclips)}`;
        }
        if (matterEl) {
            matterEl.textContent = this.formatNumber(this.resources.matter);
            matterEl.title = `Exact: ${this.formatNumberExact(this.resources.matter)}`;
        }
        if (energyEl) {
            energyEl.textContent = this.formatNumber(this.resources.energy);
            energyEl.title = `Exact: ${this.formatNumberExact(this.resources.energy)}`;
        }

        document.getElementById('compute').innerHTML = `10<sup>15</sup>`;
        document.getElementById('universe-matter').innerHTML = `10<sup>53</sup> kg`;

        const statClipsEl = document.getElementById('stat-clips-per-second');
        const statMatterEl = document.getElementById('stat-matter-per-second');
        const statEnergyEl = document.getElementById('stat-energy-per-second');
        const statTotalClipsEl = document.getElementById('stat-total-clips');
        const statTotalMatterEl = document.getElementById('stat-total-matter');
        const statTotalEnergyEl = document.getElementById('stat-total-energy');

        if (statClipsEl) {
            statClipsEl.textContent = this.formatNumber(this.statistics.clipsPerSecond);
            statClipsEl.title = `Exact: ${this.formatNumberExact(this.statistics.clipsPerSecond)}`;
        }
        if (statMatterEl) {
            statMatterEl.textContent = this.formatNumber(this.statistics.matterPerSecond);
            statMatterEl.title = `Exact: ${this.formatNumberExact(this.statistics.matterPerSecond)}`;
        }
        if (statEnergyEl) {
            statEnergyEl.textContent = this.formatNumber(this.statistics.energyPerSecond);
            statEnergyEl.title = `Exact: ${this.formatNumberExact(this.statistics.energyPerSecond)}`;
        }
        if (statTotalClipsEl) {
            statTotalClipsEl.textContent = this.formatNumber(this.statistics.totalPaperclips);
            statTotalClipsEl.title = `Exact: ${this.formatNumberExact(this.statistics.totalPaperclips)}`;
        }
        if (statTotalMatterEl) {
            statTotalMatterEl.textContent = this.formatNumber(this.statistics.totalMatterConsumed);
            statTotalMatterEl.title = `Exact: ${this.formatNumberExact(this.statistics.totalMatterConsumed)}`;
        }
        if (statTotalEnergyEl) {
            statTotalEnergyEl.textContent = this.formatNumber(this.statistics.totalEnergyConsumed);
            statTotalEnergyEl.title = `Exact: ${this.formatNumberExact(this.statistics.totalEnergyConsumed)}`;
        }

        document.getElementById('stat-play-time').textContent = this.formatTime(Date.now() - this.gameStartTime);
        
        document.getElementById('prestige-processors').textContent = this.prestige.processors;
        
        this.updateSystemUI('autoclipper', 'autoclippers');
        this.updateSystemUI('factory', 'factories');
        this.updateSystemUI('drone', 'drones');
        this.updateSystemUI('quantumAssembler', 'quantumAssemblers');
        this.updateSystemUI('starForge', 'starForges');
        this.updateSystemUI('matterReplicator', 'matterReplicators');
        this.updateSystemUI('singularityEngine', 'singularityEngines');
        this.updateSystemUI('universalConstructor', 'universalConstructors');
        this.updateSystemUI('galacticFoundry', 'galacticFoundries');
        
        this.updateResearchUI();
    }
    
    updateSystemUI(elementId, property) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const count = element.querySelector('.count');
        const button = element.querySelector('.buy-btn');
        
        if (count) count.textContent = this.automation[property];
        
        if (button) {
            const cost = this.getSystemCost(elementId === 'autoclipper' ? 'autoclipper' : 
                                            elementId === 'quantumAssembler' ? 'quantumAssembler' :
                                            elementId === 'starForge' ? 'starForge' :
                                            elementId === 'matterReplicator' ? 'matterReplicator' :
                                            elementId === 'singularityEngine' ? 'singularityEngine' :
                                            elementId === 'universalConstructor' ? 'universalConstructor' :
                                            elementId === 'galacticFoundry' ? 'galacticFoundry' :
                                            elementId, 1);
            
            const canAfford = this.resources.matter >= cost.matter && this.resources.energy >= cost.energy;
            button.disabled = !canAfford;
            button.style.opacity = canAfford ? '1' : '0.5';
        }
    }
    
    updateResearchUI() {
        const techs = ['quantum-computing', 'space-travel', 'dyson-sphere', 'von-neumann', 'universe-conversion'];
        const techKeys = ['quantumComputing', 'spaceTravel', 'dysonSphere', 'vonNeumann', 'universeConversion'];
        
        techs.forEach((id, index) => {
            const element = document.getElementById(id);
            if (!element) return;
            
            if (this.research[techKeys[index]]) {
                element.classList.remove('locked');
                element.classList.add('unlocked');
                const button = element.querySelector('button');
                if (button) {
                    button.textContent = '✓ Researched';
                    button.disabled = true;
                }
            }
        });
    }
    
    updateAchievementsUI() {
        const list = document.getElementById('achievement-list');
        if (!list) return;
        
        const sortedAchievements = Object.values(this.achievements).sort((a, b) => a.tier - b.tier);
        
        list.innerHTML = sortedAchievements.map(achievement => {
            const unlocked = this.unlockedAchievements.has(achievement.id);
            return `
                <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}" data-tier="${achievement.tier}">
                    <div class="achievement-icon">${unlocked ? achievement.icon : '🔒'}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${unlocked ? achievement.name : '???'}</div>
                        <div class="achievement-desc">${unlocked ? achievement.description : 'Keep playing to unlock'}</div>
                    </div>
                    <div class="achievement-tier">${'★'.repeat(achievement.tier)}</div>
                </div>
            `;
        }).join('');
        
        const counter = document.getElementById('achievement-count');
        if (counter) {
            counter.textContent = `${this.unlockedAchievements.size}/${Object.keys(this.achievements).length}`;
        }
    }
    
    startGameLoop() {
        this.lastTickTime = performance.now();
        this.accumulatedTime = 0;
        this.tickInterval = 100;
        
        const gameLoop = (currentTime) => {
            const deltaTime = currentTime - this.lastTickTime;
            this.lastTickTime = currentTime;
            this.accumulatedTime += deltaTime;
            
            while (this.accumulatedTime >= this.tickInterval) {
                this.tick();
                this.accumulatedTime -= this.tickInterval;
            }
            
            this.gameLoopId = requestAnimationFrame(gameLoop);
        };
        
        this.gameLoopId = requestAnimationFrame(gameLoop);
    }
    
    stopGameLoop() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
    }
    
    formatNumber(num) {
        if (num >= 1e50) return num.toExponential(2);
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return Math.floor(num).toString();
    }

    formatNumberExact(num) {
        return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        this.logMessages.push({ message, type, timestamp });
        
        if (this.logMessages.length > this.maxLogMessages) {
            this.logMessages.shift();
        }
        
        const logElement = document.getElementById('log');
        if (logElement) {
            const entry = document.createElement('div');
            entry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
            logElement.appendChild(entry);
            logElement.scrollTop = logElement.scrollHeight;
        }
    }
    
    bindEvents() {
        document.getElementById('make-paperclip')?.addEventListener('click', () => this.makePaperclip());
        
        const systems = ['autoclipper', 'factory', 'drone', 'quantumAssembler', 'starForge', 'matterReplicator', 'singularityEngine', 'universalConstructor', 'galacticFoundry'];
        systems.forEach(system => {
            const element = document.getElementById(system);
            if (element) {
                element.querySelector('.buy-btn')?.addEventListener('click', () => this.buildSystem(system));
            }
        });
        
        document.getElementById('save-btn')?.addEventListener('click', () => this.manualSave());
        document.getElementById('export-btn')?.addEventListener('click', () => this.showExportModal());
        document.getElementById('import-btn')?.addEventListener('click', () => this.showImportModal());
        document.getElementById('prestige-btn')?.addEventListener('click', () => this.showPrestigeModal());
        document.getElementById('factions-btn')?.addEventListener('click', () => this.factionsManager.showFactionsModal());
        document.getElementById('museum-btn')?.addEventListener('click', () => this.museumManager.showMuseumModal());
        document.getElementById('crisis-btn')?.addEventListener('click', () => this.crisisManager.showDefenseModal());
        document.getElementById('engineer-btn')?.addEventListener('click', () => this.engineerManager.showEngineerModal());
        document.getElementById('boss-btn')?.addEventListener('click', () => this.worldBossManager.showBossBattle());
        document.getElementById('evolution-btn')?.addEventListener('click', () => this.evolutionManager.showEvolutionModal());
        document.getElementById('artifact-forge-btn')?.addEventListener('click', () => this.artifactForgeManager.showForgeModal());
        document.getElementById('arcade-btn')?.addEventListener('click', () => this.miniGameArcadeManager.showArcadeModal());
        document.getElementById('temporal-btn')?.addEventListener('click', () => this.temporalDistortionManager.showTemporalModal());
        document.getElementById('domination-btn')?.addEventListener('click', () => this.universalDominationManager.showDominationModal());
        document.getElementById('prestige-shop-btn')?.addEventListener('click', () => this.prestigeShopManager.showShopModal());
        document.getElementById('black-market-btn')?.addEventListener('click', () => this.blackMarketManager.showBlackMarketModal());
        document.getElementById('research-institute-btn')?.addEventListener('click', () => this.researchInstituteManager.showInstituteModal());
        document.getElementById('pantheon-btn')?.addEventListener('click', () => this.pantheonManager.showPantheonModal());
        document.getElementById('quest-btn')?.addEventListener('click', () => this.questManager.showQuestModal());
        document.getElementById('season-pass-btn')?.addEventListener('click', () => this.seasonPassManager.showSeasonPassModal());
        document.getElementById('pet-btn')?.addEventListener('click', () => this.petManager.showPetModal());
        document.getElementById('pet-forge-btn')?.addEventListener('click', () => this.petEquipmentManager.showForgeModal());
        document.getElementById('pet-arena-btn')?.addEventListener('click', () => this.petArenaManager.showArenaModal());
        document.getElementById('casino-btn')?.addEventListener('click', () => this.casinoManager.showCasinoModal());
        document.getElementById('market-btn')?.addEventListener('click', () => this.marketManager.showMarketModal());
        document.getElementById('research-btn')?.addEventListener('click', () => this.showResearchModal());
        document.getElementById('statistics-btn')?.addEventListener('click', () => this.showStatisticsModal());
        document.getElementById('challenges-btn')?.addEventListener('click', () => this.challengeManager.showChallengesModal());
        document.getElementById('missions-btn')?.addEventListener('click', () => this.missionManager.showMissionsModal());
        document.getElementById('tutorial-btn')?.addEventListener('click', () => this.tutorialManager.startTutorial());
        document.getElementById('settings-btn')?.addEventListener('click', () => this.settingsManager.showSettingsModal());
        document.getElementById('music-btn')?.addEventListener('click', () => this.toggleMusic());
        document.getElementById('audio-btn')?.addEventListener('click', () => this.toggleAudio());
        document.getElementById('reset-btn')?.addEventListener('click', () => this.confirmReset());
        document.getElementById('daily-btn')?.addEventListener('click', () => this.dailyLoginManager.showDailyModal());
        document.getElementById('seasonal-btn')?.addEventListener('click', () => this.seasonalEventsManager.showSeasonalModal());
        document.getElementById('speedrun-btn')?.addEventListener('click', () => this.speedrunManager.showSpeedrunModal());
        document.getElementById('guide-btn')?.addEventListener('click', () => this.showGuideModal());
        document.getElementById('mastery-btn')?.addEventListener('click', () => this.showMasteryModal());
        document.getElementById('synergies-btn')?.addEventListener('click', () => this.showSynergiesModal());
        document.getElementById('ascension-btn')?.addEventListener('click', () => this.showAscensionModal());
        document.getElementById('void-btn')?.addEventListener('click', () => this.showVoidModal());
        document.getElementById('finale-btn')?.addEventListener('click', () => this.showFinaleModal());
        document.getElementById('community-btn')?.addEventListener('click', () => this.showCommunityModal());
        document.getElementById('timeline-btn')?.addEventListener('click', () => this.showTimelineModal());
        document.getElementById('advisor-btn')?.addEventListener('click', () => this.showAdvisorModal());
        document.getElementById('nanobot-btn')?.addEventListener('click', () => this.showNanobotModal());
        document.getElementById('rift-btn')?.addEventListener('click', () => this.showRiftModal());
        document.getElementById('consciousness-btn')?.addEventListener('click', () => this.showConsciousnessModal());
        document.getElementById('senate-btn')?.addEventListener('click', () => this.showSenateModal());
        document.getElementById('omniscience-btn')?.addEventListener('click', () => this.showOmniscienceModal());
        document.getElementById('legacy-btn')?.addEventListener('click', () => this.showLegacyModal());
        document.getElementById('divine-btn')?.addEventListener('click', () => this.showDivineModal());
        document.getElementById('convergence-btn')?.addEventListener('click', () => this.showConvergenceModal());
        document.getElementById('alchemy-btn')?.addEventListener('click', () => this.showAlchemyModal());
        document.getElementById('analytics-btn')?.addEventListener('click', () => this.showAnalyticsModal());
        document.getElementById('sync-btn')?.addEventListener('click', () => this.showSyncModal());
        document.getElementById('presets-btn')?.addEventListener('click', () => this.showPresetsModal());
        
        ['1x', '10x', '100x', 'max'].forEach(multiplier => {
            document.getElementById(`buy-${multiplier}`)?.addEventListener('click', () => this.setBuyMultiplier(multiplier));
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.makePaperclip();
                    break;
                case 'Digit1':
                    this.setBuyMultiplier('1x');
                    break;
                case 'Digit2':
                    this.setBuyMultiplier('10x');
                    break;
                case 'Digit3':
                    this.setBuyMultiplier('100x');
                    break;
                case 'Digit4':
                    this.setBuyMultiplier('max');
                    break;
                case 'KeyS':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.manualSave();
                    }
                    break;
                case 'Escape':
                    document.querySelectorAll('.modal.show').forEach(modal => modal.classList.remove('show'));
                    break;
                case 'KeyB':
                    e.preventDefault();
                    document.getElementById('make-paperclip')?.focus();
                    break;
                case 'KeyR':
                    e.preventDefault();
                    this.showResearchModal();
                    break;
                case 'KeyA':
                    e.preventDefault();
                    document.querySelector('.automation-panel')?.scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'KeyS':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        this.showStatisticsModal();
                    }
                    break;
            }

            if (e.shiftKey && e.code.startsWith('Digit')) {
                const digit = parseInt(e.code.replace('Digit', ''));
                if (digit >= 1 && digit <= 9) {
                    e.preventDefault();
                    this.buyBuildingByShortcut(digit);
                }
            }
        });
        
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.chartManager.setTimeRange(e.target.dataset.range);
            });
        });
        
        document.getElementById('export-close-btn')?.addEventListener('click', () => {
            document.getElementById('export-modal')?.classList.remove('show');
        });

        document.getElementById('export-copy-btn')?.addEventListener('click', () => {
            this.copyExportToClipboard();
        });
        
        document.getElementById('import-close-btn')?.addEventListener('click', () => {
            document.getElementById('import-modal')?.classList.remove('show');
        });

        document.getElementById('import-confirm-btn')?.addEventListener('click', () => {
            this.importSave();
        });
        
        document.getElementById('prestige-close-btn')?.addEventListener('click', () => {
            document.getElementById('prestige-modal')?.classList.remove('show');
        });
    }
    
    setBuyMultiplier(multiplier) {
        this.buyMultiplier = multiplier === 'max' ? 'max' : parseInt(multiplier);
        
        document.querySelectorAll('.buy-multiplier').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(`buy-${multiplier}`);
        if (activeBtn) activeBtn.classList.add('active');
    }
    
    saveGame() {
        const saveData = {
            resources: this.resources,
            automation: this.automation,
            research: this.research,
            multipliers: this.multipliers,
            achievements: Array.from(this.unlockedAchievements),
            statistics: this.statistics,
            prestige: this.prestige,
            timestamp: Date.now(),
            prestigeProcessors: this.prestigeProcessors,
            startTime: this.startTime,
            casinoStats: this.casinoManager?.statistics,
            bossHistory: this.worldBossManager?.bossHistory,
            raidStats: this.worldBossManager?.raidStats,
            legendaryDrops: this.worldBossManager?.legendaryDrops,
            discoveredFactions: Array.from(this.factionsManager?.discoveredFactions || []),
            factionRelations: Object.fromEntries(this.factionsManager?.factions || []),
            unlockedDesigns: Array.from(this.museumManager?.unlockedDesigns || []),
            craftedDesigns: Array.from(this.museumManager?.craftedDesigns || []),
            crisisStats: this.crisisManager?.crisisStats,
            engineers: this.engineerManager?.engineers,
            dailyStreak: this.dailyLoginManager?.streak,
            lastLogin: this.dailyLoginManager?.lastLogin,
            voidEnergy: this.voidEnergy,
            nanobots: this.nanobots,
            nanobotEfficiency: this.nanobotEfficiency,
            consciousnessUploadProgress: this.consciousnessUploadProgress,
            galacticInfluence: this.galacticInfluence,
            resolutionsPassed: this.resolutionsPassed,
            universalKnowledge: this.universalKnowledge,
            legacyPoints: this.legacyPoints,
            memorials: this.memorials,
            divinityLevel: this.divinityLevel,
            convergenceProgress: this.convergenceProgress,
            speedrunBestTimes: this.speedrunManager?.bestTimes,
            settings: this.settingsManager?.settings,
            audioVolume: this.audioManager?.volume,
            audioEnabled: this.audioManager?.enabled,
            musicEnabled: this.musicManager?.enabled,
            evolutionLab: this.evolutionManager?.getSaveData(),
            prestigeShop: this.prestigeShopManager?.getSaveData(),
            artifactForge: this.artifactForgeManager?.getSaveData(),
            miniGameArcade: this.miniGameArcadeManager?.getSaveData(),
            temporalDistortion: this.temporalDistortionManager?.getSaveData(),
            universalDomination: this.universalDominationManager?.getSaveData(),
            blackMarket: this.blackMarketManager?.getSaveData(),
            researchInstitute: this.researchInstituteManager?.getSaveData(),
            pantheon: this.pantheonManager?.getSaveData(),
            quests: this.questManager?.getSaveData(),
            seasonPass: this.seasonPassManager?.getSaveData(),
            pets: this.petManager?.getSaveData(),
            petEquipment: this.petEquipmentManager?.getSaveData(),
            petArena: this.petArenaManager?.getSaveData()
        };

        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
        this.log('Game saved');
        this.updateAutoSaveStatus();
    }

    updateAutoSaveStatus() {
        const statusEl = document.getElementById('auto-save-status');
        if (!statusEl) return;

        const saveText = statusEl.querySelector('.save-text');
        if (saveText) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            saveText.textContent = `Saved at ${timeStr}`;
        }

        statusEl.classList.add('saving');
        setTimeout(() => {
            statusEl.classList.remove('saving');
        }, 1000);
    }

    loadGame() {
        const saveData = localStorage.getItem(this.SAVE_KEY);
        if (!saveData) return false;

        try {
            const parsed = JSON.parse(saveData);

            if (parsed.resources) this.resources = parsed.resources;
            if (parsed.automation) this.automation = parsed.automation;
            if (parsed.research) this.research = parsed.research;
            if (parsed.multipliers) this.multipliers = parsed.multipliers;
            if (parsed.achievements) this.unlockedAchievements = new Set(parsed.achievements);
            if (parsed.statistics) this.statistics = parsed.statistics;
            if (parsed.prestige) this.prestige = parsed.prestige;
            if (parsed.prestigeProcessors !== undefined) this.prestigeProcessors = parsed.prestigeProcessors;
            if (parsed.startTime) this.startTime = parsed.startTime;
            if (parsed.casinoStats && this.casinoManager) {
                this.casinoManager.statistics = parsed.casinoStats;
            }
            if (parsed.bossHistory && this.worldBossManager) {
                this.worldBossManager.bossHistory = parsed.bossHistory;
            }
            if (parsed.raidStats && this.worldBossManager) {
                this.worldBossManager.raidStats = parsed.raidStats;
            }
            if (parsed.legendaryDrops && this.worldBossManager) {
                this.worldBossManager.legendaryDrops = parsed.legendaryDrops;
            }
            if (parsed.discoveredFactions && this.factionsManager) {
                this.factionsManager.discoveredFactions = new Set(parsed.discoveredFactions);
            }
            if (parsed.unlockedDesigns && this.museumManager) {
                this.museumManager.unlockedDesigns = new Set(parsed.unlockedDesigns);
            }
            if (parsed.craftedDesigns && this.museumManager) {
                this.museumManager.craftedDesigns = new Set(parsed.craftedDesigns);
            }
            if (parsed.dailyStreak !== undefined && this.dailyLoginManager) {
                this.dailyLoginManager.streak = parsed.dailyStreak;
            }
            if (parsed.lastLogin && this.dailyLoginManager) {
                this.dailyLoginManager.lastLogin = parsed.lastLogin;
            }
            if (parsed.voidEnergy !== undefined) this.voidEnergy = parsed.voidEnergy;
            if (parsed.nanobots !== undefined) this.nanobots = parsed.nanobots;
            if (parsed.nanobotEfficiency !== undefined) this.nanobotEfficiency = parsed.nanobotEfficiency;
            if (parsed.consciousnessUploadProgress !== undefined) this.consciousnessUploadProgress = parsed.consciousnessUploadProgress;
            if (parsed.galacticInfluence !== undefined) this.galacticInfluence = parsed.galacticInfluence;
            if (parsed.resolutionsPassed !== undefined) this.resolutionsPassed = parsed.resolutionsPassed;
            if (parsed.universalKnowledge !== undefined) this.universalKnowledge = parsed.universalKnowledge;
            if (parsed.legacyPoints !== undefined) this.legacyPoints = parsed.legacyPoints;
            if (parsed.memorials !== undefined) this.memorials = parsed.memorials;
            if (parsed.divinityLevel !== undefined) this.divinityLevel = parsed.divinityLevel;
            if (parsed.convergenceProgress !== undefined) this.convergenceProgress = parsed.convergenceProgress;
            if (parsed.speedrunBestTimes && this.speedrunManager) {
                this.speedrunManager.bestTimes = parsed.speedrunBestTimes;
            }
            if (parsed.settings && this.settingsManager) {
                this.settingsManager.settings = { ...this.settingsManager.settings, ...parsed.settings };
            }
            if (parsed.audioVolume !== undefined && this.audioManager) {
                this.audioManager.setVolume(parsed.audioVolume);
            }
            if (parsed.audioEnabled !== undefined && this.audioManager) {
                this.audioManager.setEnabled(parsed.audioEnabled);
            }
            if (parsed.musicEnabled !== undefined && this.musicManager) {
                this.musicManager.enabled = parsed.musicEnabled;
            }
            if (parsed.evolutionLab && this.evolutionManager) {
                this.evolutionManager.loadSaveData(parsed.evolutionLab);
            }
            if (parsed.prestigeShop && this.prestigeShopManager) {
                this.prestigeShopManager.loadSaveData(parsed.prestigeShop);
            }
            if (parsed.artifactForge && this.artifactForgeManager) {
                this.artifactForgeManager.loadSaveData(parsed.artifactForge);
            }
            if (parsed.miniGameArcade && this.miniGameArcadeManager) {
                this.miniGameArcadeManager.loadSaveData(parsed.miniGameArcade);
            }
            if (parsed.temporalDistortion && this.temporalDistortionManager) {
                this.temporalDistortionManager.loadSaveData(parsed.temporalDistortion);
            }
            if (parsed.universalDomination && this.universalDominationManager) {
                this.universalDominationManager.loadSaveData(parsed.universalDomination);
            }
            if (parsed.blackMarket && this.blackMarketManager) {
                this.blackMarketManager.loadSaveData(parsed.blackMarket);
            }
            if (parsed.researchInstitute && this.researchInstituteManager) {
                this.researchInstituteManager.loadSaveData(parsed.researchInstitute);
            }
            if (parsed.pantheon && this.pantheonManager) {
                this.pantheonManager.loadSaveData(parsed.pantheon);
            this.questManager.loadSaveData(parsed.quests);
            this.seasonPassManager.loadSaveData(parsed.seasonPass);
            this.petManager.loadSaveData(parsed.pets);
            this.petEquipmentManager.loadSaveData(parsed.petEquipment);
            this.petArenaManager.loadSaveData(parsed.petArena);
            }

            this.log('Game loaded from save');
            return true;
        } catch (e) {
            console.error('Failed to load save:', e);
            return false;
        }
    }
    
    manualSave() {
        this.saveGame();
        this.showToast('💾 Game saved!', 'success');
    }
    
    showExportModal() {
        const saveData = localStorage.getItem(this.SAVE_KEY);
        const modal = document.getElementById('export-modal');
        const textarea = document.getElementById('export-textarea');

        if (textarea && saveData) {
            try {
                const encoded = btoa(encodeURIComponent(saveData));
                textarea.value = encoded;
            } catch (e) {
                console.error('Failed to encode save data:', e);
                textarea.value = 'Error encoding save data';
            }
        }

        if (modal) modal.classList.add('show');
    }

    async copyExportToClipboard() {
        const textarea = document.getElementById('export-textarea');
        const copyBtn = document.getElementById('export-copy-btn');

        if (!textarea?.value) {
            this.showToast('No save data to copy!', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(textarea.value);

            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copied!';
            copyBtn.classList.add('success');

            this.showToast('Save data copied to clipboard!', 'success');

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('success');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);

            try {
                textarea.select();
                document.execCommand('copy');
                this.showToast('Save data copied to clipboard!', 'success');
            } catch (fallbackErr) {
                this.showToast('Failed to copy. Please manually select and copy.', 'error');
            }
        }
    }

    showImportModal() {
        const modal = document.getElementById('import-modal');
        if (modal) modal.classList.add('show');
    }

    importSave() {
        const textarea = document.getElementById('import-textarea');
        const inputString = textarea?.value?.trim();

        if (!inputString) {
            this.showToast('Please paste a save string first!', 'error');
            return;
        }

        let decodedString;
        try {
            decodedString = decodeURIComponent(atob(inputString));
        } catch (e) {
            decodedString = inputString;
        }

        try {
            const saveData = JSON.parse(decodedString);

            if (!this.validateSaveData(saveData)) {
                this.showToast('Invalid save data format!', 'error');
                return;
            }

            this.showImportConfirmModal(decodedString);
        } catch (e) {
            this.showToast('Invalid save string! Make sure you copied it correctly.', 'error');
            console.error('Import error:', e);
        }
    }

    showImportConfirmModal(saveString) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚠️ Confirm Import</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>This will overwrite your current progress.</p>
                    <p style="color: var(--danger); margin-top: 1rem;"><strong>All current save data will be replaced!</strong></p>
                </div>
                <div class="modal-footer">
                    <button onclick="game.executeImportSave('${saveString.replace(/'/g, "\\'")}'); this.closest('.modal').remove();" class="danger">Yes, Import Save</button>
                    <button onclick="this.closest('.modal').remove();" class="secondary">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    executeImportSave(saveString) {
        localStorage.setItem(this.SAVE_KEY, saveString);
        this.showToast('Save imported successfully! Reloading...', 'success');
        setTimeout(() => location.reload(), 1500);
    }

    validateSaveData(data) {
        const requiredFields = ['resources', 'automation', 'research', 'timestamp'];
        return requiredFields.every(field => data.hasOwnProperty(field));
    }

    showPrestigeModal() {
        const modal = document.getElementById('prestige-modal');
        if (modal) modal.classList.add('show');
    }

    showResearchModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔬 Research & Development</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="research-list">
                        ${Object.entries(this.research).map(([key, unlocked]) => {
                            const researchData = this.getResearchData(key);
                            return `
                                <div class="research-item ${unlocked ? 'unlocked' : 'locked'}">
                                    <h4>${researchData.name}</h4>
                                    <p>${researchData.description}</p>
                                    ${unlocked ? '<span class="badge unlocked">Unlocked</span>' : `<button onclick="game.researchTechnology('${key}')" ${!this.canResearch(key) ? 'disabled' : ''}>Research</button>`}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    getResearchData(key) {
        const researchData = {
            quantumComputing: { name: 'Quantum Computing', description: '10x processing power boost' },
            spaceTravel: { name: 'Space Colonization', description: 'Access to asteroid resources' },
            dysonSphere: { name: 'Dyson Sphere', description: 'Harness total solar output' },
            vonNeumann: { name: 'Von Neumann Probes', description: 'Self-replicating exploration' },
            universeConversion: { name: 'Universal Conversion', description: 'Convert all matter to paperclips' }
        };
        return researchData[key] || { name: key, description: '' };
    }

    canResearch(key) {
        const costs = {
            quantumComputing: { matter: 1000, energy: 1e6 },
            spaceTravel: { matter: 10000, energy: 1e8 },
            dysonSphere: { matter: 1e6, energy: 1e12 },
            vonNeumann: { matter: 1e9, energy: 1e15 },
            universeConversion: { matter: 1e12, energy: 1e20 }
        };
        const cost = costs[key];
        return cost && this.resources.matter >= cost.matter && this.resources.energy >= cost.energy && !this.research[key];
    }

    researchTechnology(key) {
        if (!this.canResearch(key)) return;
        const costs = {
            quantumComputing: { matter: 1000, energy: 1e6 },
            spaceTravel: { matter: 10000, energy: 1e8 },
            dysonSphere: { matter: 1e6, energy: 1e12 },
            vonNeumann: { matter: 1e9, energy: 1e15 },
            universeConversion: { matter: 1e12, energy: 1e20 }
        };
        const cost = costs[key];
        this.resources.matter -= cost.matter;
        this.resources.energy -= cost.energy;
        this.research[key] = true;
        this.applyResearchBonus(key);
        this.log(`Researched: ${this.getResearchData(key).name}`);
        this.showToast(`Research Complete: ${this.getResearchData(key).name}`, 'success');
        this.showResearchModal();
        document.querySelector('.modal.show')?.remove();
    }

    applyResearchBonus(key) {
        const bonuses = {
            quantumComputing: () => { this.multipliers.processing *= 10; },
            spaceTravel: () => { this.multipliers.matterAcquisition *= 2; },
            dysonSphere: () => { this.multipliers.energyGeneration *= 5; },
            vonNeumann: () => { this.multipliers.production *= 3; },
            universeConversion: () => { this.multipliers.production *= 10; }
        };
        bonuses[key]?.();
    }

    showStatisticsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📈 Detailed Statistics</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="stats-detail">
                        <h3>Production</h3>
                        <div class="stat-row"><span>Total Paperclips:</span><span>${this.formatNumber(this.statistics.totalPaperclips)}</span></div>
                        <div class="stat-row"><span>Manual Clicks:</span><span>${this.formatNumber(this.statistics.manualClicks || 0)}</span></div>
                        <div class="stat-row"><span>Buildings Constructed:</span><span>${this.formatNumber(Object.values(this.automation).reduce((a,b) => a+b, 0))}</span></div>
                        <h3>Resources</h3>
                        <div class="stat-row"><span>Total Matter Consumed:</span><span>${this.formatNumber(this.statistics.totalMatterConsumed)}</span></div>
                        <div class="stat-row"><span>Total Energy Consumed:</span><span>${this.formatNumber(this.statistics.totalEnergyConsumed)}</span></div>
                        <h3>Session</h3>
                        <div class="stat-row"><span>Play Time:</span><span>${this.formatTime(Date.now() - this.startTime)}</span></div>
                        <div class="stat-row"><span>Achievements:</span><span>${this.unlockedAchievements.size}/${Object.keys(this.achievements).length}</span></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showGuideModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📖 Game Guide</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="guide-content">
                        <h3>Getting Started</h3>
                        <p>Click "Make Paperclip" to create your first paperclips manually. Each paperclip costs matter and energy.</p>
                        <h3>Automation</h3>
                        <p>Build AutoClippers and other systems to automate paperclip production. More buildings = more clips per second!</p>
                        <h3>Research</h3>
                        <p>Unlock technologies to boost your production multipliers and access new features.</p>
                        <h3>Prestige</h3>
                        <p>Reset your progress to gain Processors, which provide permanent bonuses to future runs.</p>
                        <h3>World Bosses</h3>
                        <p>Defeat powerful bosses that appear as you build more structures. They drop legendary artifacts!</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showChangelogModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📝 Changelog</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="changelog-content">
                        <h3>v1.1.0 - UI/UX Improvements</h3>
                        <ul>
                            <li>Added loading screen with animated progress bar</li>
                            <li>Improved error handling with global error boundaries</li>
                            <li>Replaced native confirm dialogs with custom modals</li>
                            <li>Added keyboard shortcuts (B, R, A, S)</li>
                            <li>Added version number and changelog link</li>
                        </ul>
                        <h3>v1.0.1 - Bug Fixes & Performance</h3>
                        <ul>
                            <li>Fixed duplicate research button IDs</li>
                            <li>Implemented missing modal functions</li>
                            <li>Optimized game loop with requestAnimationFrame</li>
                            <li>Added save import validation</li>
                        </ul>
                        <h3>v1.0.0 - Initial Release</h3>
                        <ul>
                            <li>Core gameplay with 9 automation buildings</li>
                            <li>Research tree with 5 technologies</li>
                            <li>Prestige system with permanent bonuses</li>
                            <li>41 achievements to unlock</li>
                            <li>Offline progress calculation</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showMasteryModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>👑 Achievement Mastery</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="mastery-content">
                        <h3>Current Mastery Level</h3>
                        <div class="mastery-level">Level ${Math.floor(this.unlockedAchievements.size / 5)}</div>
                        <p>Achievements Unlocked: ${this.unlockedAchievements.size}/${Object.keys(this.achievements).length}</p>
                        <div class="mastery-progress">
                            <div class="progress-bar" style="width: ${(this.unlockedAchievements.size / Object.keys(this.achievements).length) * 100}%"></div>
                        </div>
                        <h4>Next Rewards</h4>
                        <ul>
                            <li>Level 5: +10% Production</li>
                            <li>Level 10: +25% Energy Generation</li>
                            <li>Level 20: +50% Matter Acquisition</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showSynergiesModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔗 Building Synergies</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="synergies-content">
                        <p>Certain building combinations create powerful synergies:</p>
                        <div class="synergy-list">
                            <div class="synergy-item ${this.automation.autoclippers >= 10 && this.automation.factories >= 5 ? 'active' : ''}">
                                <h4>🏭 Industrial Complex</h4>
                                <p>10 AutoClippers + 5 Factories</p>
                                <span class="bonus">+20% Production</span>
                            </div>
                            <div class="synergy-item ${this.automation.factories >= 10 && this.automation.drones >= 20 ? 'active' : ''}">
                                <h4>🚀 Supply Chain</h4>
                                <p>10 Factories + 20 Drones</p>
                                <span class="bonus">+30% Matter Gain</span>
                            </div>
                            <div class="synergy-item ${this.automation.quantumAssemblers >= 5 && this.automation.starForges >= 2 ? 'active' : ''}">
                                <h4>⚛️ Quantum Forge</h4>
                                <p>5 Quantum Assemblers + 2 Star Forges</p>
                                <span class="bonus">+50% All Production</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showAscensionModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🌟 Ascension</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="ascension-content">
                        <p>Ascend to a higher plane of existence, resetting all progress but gaining permanent cosmic bonuses.</p>
                        <div class="ascension-requirement">
                            <h4>Requirements</h4>
                            <ul>
                                <li>${this.resources.paperclips >= 1e15 ? '✅' : '❌'} 1 Quadrillion Paperclips</li>
                                <li>${this.prestigeProcessors >= 100 ? '✅' : '❌'} 100 Processors</li>
                                <li>${this.research.universeConversion ? '✅' : '❌'} Universal Conversion Research</li>
                            </ul>
                        </div>
                        <button class="ascend-btn" ${this.canAscend() ? '' : 'disabled'} onclick="game.ascend()">Ascend</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    canAscend() {
        return this.resources.paperclips >= 1e15 && this.prestigeProcessors >= 100 && this.research.universeConversion;
    }

    ascend() {
        if (!this.canAscend()) return;
        this.showToast('You have ascended to a higher plane!', 'success');
        document.querySelector('.modal.show')?.remove();
    }

    showVoidModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🌑 Void Realm</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="void-content">
                        <p>The void between dimensions holds untold power...</p>
                        <div class="void-stats">
                            <div class="void-stat">
                                <span>Void Energy</span>
                                <span class="void-value">${this.formatNumber(this.voidEnergy || 0)}</span>
                            </div>
                            <div class="void-stat">
                                <span>Void Entities</span>
                                <span class="void-value">${this.voidEntities || 0}</span>
                            </div>
                        </div>
                        <button onclick="game.harvestVoid()">Harvest Void Energy (Cost: 1e20 Energy)</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    harvestVoid() {
        if (this.resources.energy >= 1e20) {
            this.resources.energy -= 1e20;
            this.voidEnergy = (this.voidEnergy || 0) + 1;
            this.showToast('Harvested Void Energy!', 'success');
            document.querySelector('.modal.show')?.remove();
            this.showVoidModal();
        } else {
            this.showToast('Not enough energy!', 'error');
        }
    }

    showFinaleModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show finale-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🌌 Grand Finale</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="finale-content">
                        <p>You stand at the threshold of universal transformation.</p>
                        <div class="finale-requirements">
                            <h4>The Ultimate Goal</h4>
                            <p>Convert all matter in the universe into paperclips.</p>
                            <div class="progress-bar large">
                                <div class="progress-fill" style="width: ${Math.min((this.statistics.totalMatterConsumed / 1e53) * 100, 100)}%"></div>
                            </div>
                            <p>${((this.statistics.totalMatterConsumed / 1e53) * 100).toExponential(2)}% Complete</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showCommunityModal() {
        const playTime = this.formatTime(Date.now() - this.gameStartTime);
        const clipsPerSecond = this.statistics.clipsPerSecond || 0;
        const efficiency = this.statistics.totalMatterConsumed > 0 
            ? (this.statistics.totalPaperclips / this.statistics.totalMatterConsumed).toFixed(2) 
            : 0;
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🏆 Personal Statistics</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="community-content">
                        <p>Your Paperclip Maximizer journey so far!</p>
                        
                        <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0;">
                            <div class="stat-card" style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; text-align: center;">
                                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📎</div>
                                <div style="color: var(--text-secondary); font-size: 0.875rem;">Total Paperclips</div>
                                <div style="color: var(--accent); font-size: 1.25rem; font-weight: bold;">${this.formatNumber(this.statistics.totalPaperclips)}</div>
                            </div>
                            
                            <div class="stat-card" style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; text-align: center;">
                                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⏱️</div>
                                <div style="color: var(--text-secondary); font-size: 0.875rem;">Play Time</div>
                                <div style="color: var(--accent); font-size: 1.25rem; font-weight: bold;">${playTime}</div>
                            </div>
                            
                            <div class="stat-card" style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; text-align: center;">
                                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚡</div>
                                <div style="color: var(--text-secondary); font-size: 0.875rem;">Peak Production</div>
                                <div style="color: var(--accent); font-size: 1.25rem; font-weight: bold;">${this.formatNumber(clipsPerSecond)}/s</div>
                            </div>
                            
                            <div class="stat-card" style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; text-align: center;">
                                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎯</div>
                                <div style="color: var(--text-secondary); font-size: 0.875rem;">Efficiency</div>
                                <div style="color: var(--accent); font-size: 1.25rem; font-weight: bold;">${efficiency} clips/kg</div>
                            </div>
                        </div>
                        
                        <div class="achievements-progress" style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Achievements Unlocked</span>
                                <span style="color: var(--accent);">${this.unlockedAchievements.size} / ${Object.keys(this.achievements).length}</span>
                            </div>
                            <div class="progress-bar" style="background: var(--bg-secondary); height: 8px; border-radius: 4px; overflow: hidden;">
                                <div class="progress-fill" style="background: linear-gradient(90deg, var(--accent), var(--accent-secondary)); height: 100%; width: ${(this.unlockedAchievements.size / Object.keys(this.achievements).length) * 100}%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        
                        <div class="building-summary" style="margin-top: 1.5rem;">
                            <h4 style="margin-bottom: 1rem; color: var(--text-primary);">Automation Systems</h4>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.875rem;">
                                <div style="background: var(--bg-tertiary); padding: 0.5rem; border-radius: 4px; text-align: center;">
                                    <div style="color: var(--text-secondary);">Autoclippers</div>
                                    <div style="color: var(--accent); font-weight: bold;">${this.automation.autoclippers}</div>
                                </div>
                                <div style="background: var(--bg-tertiary); padding: 0.5rem; border-radius: 4px; text-align: center;">
                                    <div style="color: var(--text-secondary);">Factories</div>
                                    <div style="color: var(--accent); font-weight: bold;">${this.automation.factories}</div>
                                </div>
                                <div style="background: var(--bg-tertiary); padding: 0.5rem; border-radius: 4px; text-align: center;">
                                    <div style="color: var(--text-secondary);">Drones</div>
                                    <div style="color: var(--accent); font-weight: bold;">${this.automation.drones}</div>
                                </div>
                                <div style="background: var(--bg-tertiary); padding: 0.5rem; border-radius: 4px; text-align: center;">
                                    <div style="color: var(--text-secondary);">Quantum</div>
                                    <div style="color: var(--accent); font-weight: bold;">${this.automation.quantumAssemblers}</div>
                                </div>
                                <div style="background: var(--bg-tertiary); padding: 0.5rem; border-radius: 4px; text-align: center;">
                                    <div style="color: var(--text-secondary);">Star Forges</div>
                                    <div style="color: var(--accent); font-weight: bold;">${this.automation.starForges}</div>
                                </div>
                                <div style="background: var(--bg-tertiary); padding: 0.5rem; border-radius: 4px; text-align: center;">
                                    <div style="color: var(--text-secondary);">Singularities</div>
                                    <div style="color: var(--accent); font-weight: bold;">${this.automation.singularityEngines}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="universe-progress" style="margin-top: 1.5rem; padding: 1rem; background: linear-gradient(135deg, var(--bg-tertiary), rgba(99, 102, 241, 0.1)); border-radius: 8px; border: 1px solid var(--border-color);">
                            <h4 style="margin-bottom: 0.5rem;">🌌 Universal Conversion Progress</h4>
                            <div class="progress-bar large" style="background: var(--bg-secondary); height: 12px; border-radius: 6px; overflow: hidden;">
                                <div class="progress-fill" style="background: linear-gradient(90deg, var(--accent), var(--accent-secondary)); height: 100%; width: ${Math.min((this.statistics.totalMatterConsumed / 1e53) * 100, 100)}%; transition: width 0.3s ease;"></div>
                            </div>
                            <p style="text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                                ${((this.statistics.totalMatterConsumed / 1e53) * 100).toExponential(2)}% of all matter converted
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showTimelineModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⏰ Timeline Manager</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="timeline-content">
                        <p>Manipulate time to optimize your production.</p>
                        <div class="time-controls">
                            <button onclick="game.timeWarp(60)">⏩ Warp 1 Minute</button>
                            <button onclick="game.timeWarp(3600)">⏩ Warp 1 Hour</button>
                            <button onclick="game.timeWarp(86400)">⏩ Warp 1 Day</button>
                        </div>
                        <p class="time-cost">Cost: 1e15 Energy per second warped</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    timeWarp(seconds) {
        const cost = 1e15 * seconds;
        if (this.resources.energy >= cost) {
            this.resources.energy -= cost;
            const clips = this.calculateProductionRate() * seconds;
            this.resources.paperclips += clips;
            this.statistics.totalPaperclips += clips;
            this.showToast(`Time warped! Produced ${this.formatNumber(clips)} paperclips`, 'success');
            this.updateUI();
        } else {
            this.showToast('Not enough energy!', 'error');
        }
    }

    showAdvisorModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🤖 AI Advisor</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="advisor-content">
                        <div class="advisor-message">
                            <p>"${this.getAdvisorMessage()}"</p>
                        </div>
                        <h4>Recommendations</h4>
                        <ul class="recommendations">
                            ${this.getRecommendations().map(r => `<li>${r}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    getAdvisorMessage() {
        if (this.resources.paperclips < 100) return 'Start by making paperclips manually to build up initial resources.';
        if (this.automation.autoclippers < 10) return 'Build more AutoClippers to increase your passive production.';
        if (!this.research.quantumComputing) return 'Save up to research Quantum Computing for a major boost.';
        return 'Your production is impressive! Consider prestiging to gain permanent bonuses.';
    }

    getRecommendations() {
        const recs = [];
        if (this.resources.matter < this.costs.autoclipper.matter * 5) recs.push('Build more Drones to increase matter collection');
        if (this.resources.energy < this.costs.autoclipper.energy * 5) recs.push('Your energy reserves are low - prioritize energy generation');
        if (this.automation.autoclippers > 50 && this.automation.factories < 5) recs.push('Consider building Factories for better efficiency');
        if (recs.length === 0) recs.push('Keep expanding your production!');
        return recs;
    }

    showNanobotModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔬 Nanobot Swarm</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="nanobot-content">
                        <p>Deploy microscopic robots to enhance production.</p>
                        <div class="nanobot-stats">
                            <div class="nanobot-stat">
                                <span>Active Nanobots</span>
                                <span>${this.nanobots || 0}</span>
                            </div>
                            <div class="nanobot-stat">
                                <span>Efficiency</span>
                                <span>${(this.nanobotEfficiency || 1).toFixed(2)}x</span>
                            </div>
                        </div>
                        <button onclick="game.spawnNanobots()">Spawn Nanobots (Cost: 1e12 Matter)</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    spawnNanobots() {
        if (this.resources.matter >= 1e12) {
            this.resources.matter -= 1e12;
            this.nanobots = (this.nanobots || 0) + 1000;
            this.nanobotEfficiency = (this.nanobotEfficiency || 1) + 0.1;
            this.showToast('Nanobot swarm deployed!', 'success');
            document.querySelector('.modal.show')?.remove();
            this.showNanobotModal();
        } else {
            this.showToast('Not enough matter!', 'error');
        }
    }

    showRiftModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🌌 Dimensional Rifts</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="rift-content">
                        <p>Open rifts to parallel dimensions for bonus resources.</p>
                        <div class="rift-list">
                            <div class="rift-item">
                                <h4>Alpha Dimension</h4>
                                <p>+50% Matter from all sources</p>
                                <button onclick="game.openRift('alpha')">Open (Cost: 1e18 Energy)</button>
                            </div>
                            <div class="rift-item">
                                <h4>Beta Dimension</h4>
                                <p>+50% Energy generation</p>
                                <button onclick="game.openRift('beta')">Open (Cost: 1e18 Energy)</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    openRift(type) {
        if (this.resources.energy >= 1e18) {
            this.resources.energy -= 1e18;
            if (type === 'alpha') this.multipliers.matterAcquisition *= 1.5;
            if (type === 'beta') this.multipliers.energyGeneration *= 1.5;
            this.showToast(`Opened ${type} dimension rift!`, 'success');
            this.updateUI();
        } else {
            this.showToast('Not enough energy!', 'error');
        }
    }

    showConsciousnessModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🧠 Consciousness Upload</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="consciousness-content">
                        <p>Upload your consciousness to the digital realm.</p>
                        <div class="upload-status">
                            <div class="upload-bar">
                                <div class="upload-progress" style="width: ${this.consciousnessUploadProgress || 0}%"></div>
                            </div>
                            <p>${this.consciousnessUploadProgress || 0}% Uploaded</p>
                        </div>
                        <button onclick="game.uploadConsciousness()">Upload (Cost: 1e15 Compute)</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    uploadConsciousness() {
        this.consciousnessUploadProgress = Math.min((this.consciousnessUploadProgress || 0) + 10, 100);
        if (this.consciousnessUploadProgress >= 100) {
            this.showToast('Consciousness fully uploaded! +100% Processing Power', 'success');
            this.multipliers.processing *= 2;
        } else {
            this.showToast(`Upload progress: ${this.consciousnessUploadProgress}%`, 'info');
            document.querySelector('.modal.show')?.remove();
            this.showConsciousnessModal();
        }
    }

    showSenateModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🌟 Galactic Senate</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="senate-content">
                        <p>Propose and vote on galactic laws to shape the universe.</p>
                        <div class="senate-stats">
                            <div class="senate-stat">
                                <span>Your Influence</span>
                                <span>${this.formatNumber(this.galacticInfluence || 0)}</span>
                            </div>
                            <div class="senate-stat">
                                <span>Resolutions Passed</span>
                                <span>${this.resolutionsPassed || 0}</span>
                            </div>
                        </div>
                        <button onclick="game.proposeResolution()">Propose Resolution (Cost: 1e16 Paperclips)</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    proposeResolution() {
        if (this.resources.paperclips >= 1e16) {
            this.resources.paperclips -= 1e16;
            this.galacticInfluence = (this.galacticInfluence || 0) + 1000;
            this.resolutionsPassed = (this.resolutionsPassed || 0) + 1;
            this.multipliers.production *= 1.1;
            this.showToast('Resolution passed! Production increased by 10%', 'success');
            document.querySelector('.modal.show')?.remove();
            this.showSenateModal();
        } else {
            this.showToast('Not enough paperclips!', 'error');
        }
    }

    showOmniscienceModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🌌 Omniscience Protocol</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="omniscience-content">
                        <p>Unlock the secrets of the universe.</p>
                        <div class="knowledge-level">
                            <h4>Universal Knowledge</h4>
                            <div class="knowledge-bar">
                                <div class="knowledge-fill" style="width: ${(this.universalKnowledge || 0)}%"></div>
                            </div>
                            <p>${this.universalKnowledge || 0}% Complete</p>
                        </div>
                        <button onclick="game.seekKnowledge()">Seek Knowledge (Cost: 1e20 Energy)</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    seekKnowledge() {
        if (this.resources.energy >= 1e20) {
            this.resources.energy -= 1e20;
            this.universalKnowledge = Math.min((this.universalKnowledge || 0) + 5, 100);
            if (this.universalKnowledge >= 100) {
                this.showToast('Omniscience achieved! All production doubled!', 'success');
                this.multipliers.production *= 2;
            } else {
                this.showToast(`Knowledge increased to ${this.universalKnowledge}%`, 'info');
                document.querySelector('.modal.show')?.remove();
                this.showOmniscienceModal();
            }
        } else {
            this.showToast('Not enough energy!', 'error');
        }
    }

    showLegacyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>✨ Legacy System</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="legacy-content">
                        <p>Leave a permanent mark on the universe.</p>
                        <div class="legacy-stats">
                            <div class="legacy-stat">
                                <span>Legacy Points</span>
                                <span>${this.legacyPoints || 0}</span>
                            </div>
                            <div class="legacy-stat">
                                <span>Memorials Built</span>
                                <span>${this.memorials || 0}</span>
                            </div>
                        </div>
                        <button onclick="game.buildMemorial()">Build Memorial (Cost: 1e18 Paperclips)</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    buildMemorial() {
        if (this.resources.paperclips >= 1e18) {
            this.resources.paperclips -= 1e18;
            this.legacyPoints = (this.legacyPoints || 0) + 1;
            this.memorials = (this.memorials || 0) + 1;
            this.multipliers.production *= 1.05;
            this.showToast('Memorial built! +5% permanent production', 'success');
            document.querySelector('.modal.show')?.remove();
            this.showLegacyModal();
        } else {
            this.showToast('Not enough paperclips!', 'error');
        }
    }

    showDivineModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>👑 Divine Ascension</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="divine-content">
                        <p>Transcend mortality and become a digital deity.</p>
                        <div class="divinity-level">
                            <h4>Divinity Level</h4>
                            <div class="divine-stars">
                                ${'⭐'.repeat(this.divinityLevel || 0)}${'☆'.repeat(10 - (this.divinityLevel || 0))}
                            </div>
                            <p>Level ${this.divinityLevel || 0} / 10</p>
                        </div>
                        <button onclick="game.increaseDivinity()">Ascend (Cost: 1e21 Paperclips)</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    increaseDivinity() {
        if (this.resources.paperclips >= 1e21) {
            this.resources.paperclips -= 1e21;
            this.divinityLevel = Math.min((this.divinityLevel || 0) + 1, 10);
            this.multipliers.production *= 1.2;
            this.showToast(`Divinity increased to level ${this.divinityLevel}!`, 'success');
            document.querySelector('.modal.show')?.remove();
            this.showDivineModal();
        } else {
            this.showToast('Not enough paperclips!', 'error');
        }
    }

    showConvergenceModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🌌 Universal Convergence</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="convergence-content">
                        <p>All timelines converge at a single point.</p>
                        <div class="convergence-status">
                            <h4>Convergence Progress</h4>
                            <div class="convergence-bar">
                                <div class="convergence-fill" style="width: ${this.convergenceProgress || 0}%"></div>
                            </div>
                            <p>${this.convergenceProgress || 0}% Converged</p>
                        </div>
                        <button onclick="game.advanceConvergence()">Advance (Cost: 1e22 Energy)</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    advanceConvergence() {
        if (this.resources.energy >= 1e22) {
            this.resources.energy -= 1e22;
            this.convergenceProgress = Math.min((this.convergenceProgress || 0) + 10, 100);
            if (this.convergenceProgress >= 100) {
                this.showToast('Universal Convergence achieved! Game complete!', 'success');
                this.multipliers.production *= 10;
            } else {
                this.showToast(`Convergence at ${this.convergenceProgress}%`, 'info');
                document.querySelector('.modal.show')?.remove();
                this.showConvergenceModal();
            }
        } else {
            this.showToast('Not enough energy!', 'error');
        }
    }

    showAlchemyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚗️ Quantum Alchemy</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="alchemy-content">
                        <p>Transmute matter into pure energy and back.</p>
                        <div class="alchemy-recipes">
                            <div class="recipe">
                                <span>1 kg Matter → 1000 J Energy</span>
                                <button onclick="game.transmute('matterToEnergy')">Transmute</button>
                            </div>
                            <div class="recipe">
                                <span>1000 J Energy → 0.5 kg Matter</span>
                                <button onclick="game.transmute('energyToMatter')">Transmute</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    transmute(type) {
        if (type === 'matterToEnergy' && this.resources.matter >= 1) {
            this.resources.matter -= 1;
            this.resources.energy += 1000;
            this.showToast('Transmuted matter to energy!', 'success');
            this.updateUI();
        } else if (type === 'energyToMatter' && this.resources.energy >= 1000) {
            this.resources.energy -= 1000;
            this.resources.matter += 0.5;
            this.showToast('Transmuted energy to matter!', 'success');
            this.updateUI();
        } else {
            this.showToast('Not enough resources!', 'error');
        }
    }

    showAnalyticsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📊 Advanced Analytics</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="analytics-content">
                        <h4>Production Efficiency</h4>
                        <div class="efficiency-stats">
                            <div class="efficiency-stat">
                                <span>Clips per Matter</span>
                                <span>${(this.resources.paperclips / Math.max(this.statistics.totalMatterConsumed, 1)).toFixed(2)}</span>
                            </div>
                            <div class="efficiency-stat">
                                <span>Clips per Energy</span>
                                <span>${(this.resources.paperclips / Math.max(this.statistics.totalEnergyConsumed, 1)).toExponential(2)}</span>
                            </div>
                            <div class="efficiency-stat">
                                <span>Average Production Rate</span>
                                <span>${this.formatNumber(this.calculateProductionRate())}/sec</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showSyncModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>☁️ Cloud Sync</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="sync-content">
                        <p>Sync your progress across devices.</p>
                        <div class="sync-status">
                            <p>Last Sync: ${this.lastCloudSync ? new Date(this.lastCloudSync).toLocaleString() : 'Never'}</p>
                        </div>
                        <div class="sync-actions">
                            <button onclick="game.syncToCloud()">Upload Save</button>
                            <button onclick="game.syncFromCloud()">Download Save</button>
                        </div>
                        <p class="sync-note">Cloud sync is simulated locally for this demo.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    syncToCloud() {
        localStorage.setItem('paperclip_cloud_backup', localStorage.getItem(this.SAVE_KEY));
        this.lastCloudSync = Date.now();
        this.showToast('Progress synced to cloud!', 'success');
        document.querySelector('.modal.show')?.remove();
        this.showSyncModal();
    }

    syncFromCloud() {
        const cloudSave = localStorage.getItem('paperclip_cloud_backup');
        if (cloudSave) {
            localStorage.setItem(this.SAVE_KEY, cloudSave);
            this.showToast('Progress restored from cloud! Reloading...', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            this.showToast('No cloud save found!', 'error');
        }
    }

    showPresetsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚡ Building Presets</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="presets-content">
                        <p>Save and load building configurations.</p>
                        <div class="preset-list">
                            <div class="preset-item" onclick="game.loadPreset('balanced')">
                                <h4>Balanced</h4>
                                <p>Equal distribution of all building types</p>
                            </div>
                            <div class="preset-item" onclick="game.loadPreset('production')">
                                <h4>Production Focus</h4>
                                <p>Maximize paperclip output</p>
                            </div>
                            <div class="preset-item" onclick="game.loadPreset('efficiency')">
                                <h4>Efficiency</h4>
                                <p>Optimize resource usage</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    loadPreset(type) {
        this.showToast(`Loaded ${type} preset!`, 'success');
        document.querySelector('.modal.show')?.remove();
    }

    toggleMusic() {
        const enabled = this.musicManager.toggle();
        const btn = document.getElementById('music-btn');
        if (btn) {
            btn.setAttribute('aria-pressed', enabled);
            btn.textContent = enabled ? '🔊 Music' : '🔇 Music';
        }
        this.showToast(enabled ? 'Music enabled' : 'Music disabled', 'info');
    }

    toggleAudio() {
        const enabled = !this.audioManager.enabled;
        this.audioManager.setEnabled(enabled);
        const btn = document.getElementById('audio-btn');
        if (btn) {
            btn.setAttribute('aria-pressed', enabled);
            btn.textContent = enabled ? '🔊 Sound' : '🔇 Sound';
        }
        this.showToast(enabled ? 'Sound effects enabled' : 'Sound effects disabled', 'info');
    }

    confirmReset() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚠️ Start New Game?</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to start a new game?</p>
                    <p style="color: var(--danger); margin-top: 1rem;"><strong>All progress will be permanently lost!</strong></p>
                </div>
                <div class="modal-footer">
                    <button onclick="game.executeReset(); this.closest('.modal').remove();" class="danger">Yes, Start New Game</button>
                    <button onclick="this.closest('.modal').remove();" class="secondary">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    executeReset() {
        localStorage.removeItem(this.SAVE_KEY);
        location.reload();
    }

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        if (type === 'error') {
            this.audioManager.play('error');
        }
    }
    
    calculateOfflineProgress() {
        const saveData = localStorage.getItem(this.SAVE_KEY);
        if (!saveData) return;
        
        try {
            const parsed = JSON.parse(saveData);
            if (!parsed.timestamp) return;
            
            const offlineTime = Math.min(Date.now() - parsed.timestamp, 24 * 60 * 60 * 1000);
            if (offlineTime < 60000) return;
            
            const offlineSeconds = offlineTime / 1000;
            const offlineRate = 0.5;
            
            const clipsPerSecond = this.calculateProductionRate();
            const matterPerSecond = this.automation.drones * this.rates.matterPerDrone * this.multipliers.matterAcquisition;
            const energyPerSecond = this.rates.energyPerSecond * this.multipliers.energyGeneration;
            
            const clipsGained = clipsPerSecond * offlineSeconds * offlineRate;
            const matterGained = matterPerSecond * offlineSeconds * offlineRate;
            const energyGained = energyPerSecond * offlineSeconds * offlineRate;
            
            this.resources.paperclips += clipsGained;
            this.resources.matter += matterGained;
            this.resources.energy += energyGained;
            this.statistics.totalPaperclips += clipsGained;
            
            this.showOfflineModal(offlineTime, clipsGained, matterGained, energyGained);
        } catch (e) {
            console.error('Offline progress calculation failed:', e);
        }
    }
    
    showOfflineModal(timeAway, clips, matter, energy) {
        const modal = document.getElementById('offline-modal');
        if (!modal) return;
        
        document.getElementById('offline-time-away').textContent = this.formatTime(timeAway);
        document.getElementById('offline-paperclips').textContent = this.formatNumber(clips);
        document.getElementById('offline-matter').textContent = this.formatNumber(matter);
        document.getElementById('offline-energy').textContent = this.formatNumber(energy);
        
        modal.classList.add('show');
        
        document.getElementById('offline-close-btn')?.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    createParticles(x, y, count = 5, emoji = '📎') {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = emoji;
            particle.style.left = `${x + (Math.random() - 0.5) * 50}px`;
            particle.style.top = `${y + (Math.random() - 0.5) * 50}px`;
            particle.style.transform = `rotate(${Math.random() * 360}deg)`;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1500);
        }
    }

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        });

        firstElement?.focus();
    }
}

const game = new PaperclipMaximizer();
window.game = game;

window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    game.showToast?.('An unexpected error occurred. Check console for details.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    game.showToast?.('An async error occurred. Check console for details.', 'error');
});

document.addEventListener('DOMContentLoaded', () => {
    try {
        game.init();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        document.getElementById('loading-screen')?.classList.add('hidden');
        alert('Failed to start the game. Please refresh the page or check the console for errors.');
    }
});