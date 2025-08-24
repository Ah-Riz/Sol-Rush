import Phaser from 'phaser';
import Leaderboard from '../javascript/leaderboard';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(JSON.stringify(process.env.SUPABASE_URL), JSON.stringify(process.env.SUPABASE_ANON_KEY))
// const supabase = createClient('https://edecxikuuawbppxundkw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZWN4aWt1dWF3YnBweHVuZGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTY2NTgsImV4cCI6MjA3MTIzMjY1OH0.GmjSGgZjlJHndvHN3za4zgn4sV3piYkL1Cxpwq7UqVE')

export default class LeaderboardTable extends Phaser.Scene {
  constructor() {
    super('leaderboard-table');
  }

  init(data) {
    this.player = data.player;
    this.score = data.score;
    this.song = data.song;
    this.walletPublicKey = data.walletPublicKey;
    this.isExist = data.isExist;
  }

  preload() {
    this.width = this.scale.width;
    this.height = this.scale.height;
    const leaderboard = new Leaderboard();

    if (this.player && this.score && this.walletPublicKey && this.isExist) {
      leaderboard.saveScore(this.walletPublicKey, this.score);
    }
    this.leaderboard = leaderboard.getScores(this.walletPublicKey, this.player, this.score);
    console.log('ini '+this.leaderboard.toString());
  }

  create() {
    const title = this.make.text({
      x: this.width / 2,
      y: 50,
      text: 'LEADERBOARD',
      style: {
        fontSize: '100px',
        fill: '#fff200',
        fontFamily: 'Arcadia, monospace',
      },
    }).setOrigin(0.5, 0.5);

    this.sub = this.make.text({
      x: this.width / 2,
      y: title.y + 110,
      text: 'Rank       Player       Score',
      style: {
        fontSize: '50px',
        fill: '#003fff',
        fontFamily: 'Arcadia, monospace',
      },
    }).setOrigin(0.5, 0.5);

    this.time.delayedCall(1000, () => {
      this.leaderboard.then(result => {
        let prevRank;
        let prevName;
        let prevScore;

        for (let i = 0; i <= 4 && i < result.length; i += 1) {
          const { username, totalScore } = result[i];

          const rank = this.rankText(i + 1);
          const name = this.nameText(username);
          const scoreN = this.scoreText(totalScore);

          if (i >= 1) {
            rank.y = prevRank.y + 70;
            name.y = prevName.y + 70;
            scoreN.y = prevScore.y + 70;
          }

          prevRank = rank;
          prevName = name;
          prevScore = scoreN;
        }

        if (this.player && this.score) {
          // Prefer the entry that carries `position` (from getPlayersScores)
          const myEntry = result.find(r => r && (r.position !== undefined && r.position !== null));

          if (myEntry) {
            const { position, username, totalScore } = myEntry;

            this.make.text({
              x: this.width / 5.7,
              y: this.height - 100,
              text: position,
              style: {
                fontSize: '60px',
                fill: '#ffffff',
                fontFamily: 'Arcadia, monospace',
              },
            }).setOrigin(0.5, 0.5);

            this.make.text({
              x: this.width / 2 - 20,
              y: this.height - 100,
              text: username,
              style: {
                fontSize: '60px',
                fill: '#ffffff',
                fontFamily: 'Arcadia, monospace',
              },
            }).setOrigin(0.5, 0.5);

            this.make.text({
              x: this.width - 235,
              y: this.height - 100,
              text: totalScore,
              style: {
                fontSize: '60px',
                fill: '#ffffff',
                fontFamily: 'Arcadia, monospace',
              },
            }).setOrigin(0.5, 0.5);
          } else {
            // Fallback: try to infer position from the list if the player is present
            const idx = result.findIndex(r => r && r.username === this.player);
            if (idx >= 0) {
              const { username, totalScore } = result[idx];

              this.make.text({
                x: this.width / 5.7,
                y: this.height - 100,
                text: idx + 1,
                style: {
                  fontSize: '60px',
                  fill: '#ffffff',
                  fontFamily: 'Arcadia, monospace',
                },
              }).setOrigin(0.5, 0.5);

              this.make.text({
                x: this.width / 2 - 20,
                y: this.height - 100,
                text: username,
                style: {
                  fontSize: '60px',
                  fill: '#ffffff',
                  fontFamily: 'Arcadia, monospace',
                },
              }).setOrigin(0.5, 0.5);

              this.make.text({
                x: this.width - 235,
                y: this.height - 100,
                text: totalScore,
                style: {
                  fontSize: '60px',
                  fill: '#ffffff',
                  fontFamily: 'Arcadia, monospace',
                },
              }).setOrigin(0.5, 0.5);
            }
          }
        }
      });
    });

    this.make.text({
      x: this.width / 2,
      y: this.height - 30,
      text: "[ Press 'ENTER' to continue... ]",
      style: {
        fontSize: '30px',
        fill: '#505050',
        fontFamily: 'Monogram, monospace',
        align: 'justify',
      },
    }).setOrigin(0.5, 0.5);

    const enter = this.input.keyboard.addKey('ENTER');
    enter.on('down', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.scene.start('credits', { song: this.song });
    });
  }

  rankText(rank) {
    return this.make.text({
      x: this.width / 5.7,
      y: this.sub.y + 75,
      text: rank,
      style: {
        fontSize: '30px',
        fill: '#ffffff',
        fontFamily: 'Arcadia, monospace',
      },
    }).setOrigin(0.5, 0.5);
  }

  nameText(player) {
    return this.make.text({
      x: this.width / 2 - 20,
      y: this.sub.y + 75,
      text: player,
      style: {
        fontSize: '30px',
        fill: '#ffffff',
        fontFamily: 'Arcadia, monospace',
      },
    }).setOrigin(0.5, 0.5);
  }

  scoreText(score) {
    return this.make.text({
      x: this.width - 235,
      y: this.sub.y + 75,
      text: score,
      style: {
        fontSize: '30px',
        fill: '#ffffff',
        fontFamily: 'Arcadia, monospace',
      },
    }).setOrigin(0.5, 0.5);
  }
}