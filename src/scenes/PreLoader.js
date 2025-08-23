import Phaser from 'phaser';
import background from '../assets/background/Background 1.png';
import bgTree1 from '../assets/background/BGTrees 2.png';
import bgTree2 from '../assets/background/BGTrees 4.png';
import bgTree3 from '../assets/background/BGTrees 5.png';
import bgTree4 from '../assets/background/BGTrees 7.png';
import floor from '../assets/background/Floor 9.png';
import player from '../assets/player/player_run.png';
import playerRest from '../assets/player/player_rest.png';
import platform from '../assets/platform.png';
import playBtn from '../assets/buttons/play.png';
import walletBtn from '../assets/buttons/wallet.png';

import exitBtn from '../assets/buttons/exit.png';
import playRed from '../assets/buttons/red/play.png';
import exitRed from '../assets/buttons/red/exit.png';
import playPressed from '../assets/buttons/pressed/play.png';
import exitPressed from '../assets/buttons/pressed/exit.png';
import playerJump from '../assets/player/player_jump.png';
import playerFalling from '../assets/player/player_falling.png';
import playerAttack from '../assets/player/player_attack.png';
import playerDead from '../assets/player/player_dead.png';
import skeletonAttack from '../assets/monsters/skeleton/Skeleton Attack.png';
import skeletonWalk from '../assets/monsters/skeleton/Skeleton Walk.png';
import skeletonDead from '../assets/monsters/skeleton/Skeleton Dead.png';
import menu from '../assets/music/VGMA Challenge - July 12th.wav';
import gameMusic from '../assets/music/A mystical journey_3.ogg';
import ending from '../assets/music/Dee Yan-Key - III. Finale_ Slowly.mp3';
import spikeCollection from '../assets/obstacle/spike collection.png';
import instructionBg from '../assets/paperbackground.png';
import loadFont from '../javascript/fontLoader';
import deathSound from '../assets/sound effects/death_4_alex.wav';
import gameover from '../assets/sound effects/gameover.mp3';
import monogram from '../assets/font/monogram_extended.ttf';
import Cyberpunks from '../assets/font/Cyberpunks.ttf';

export default class PreLoad extends Phaser.Scene {
  constructor() {
    super('preLoader');
  }

  preload() {
    this.width = this.scale.width;
    this.height = this.scale.height;
    this.sound.pauseOnBlur = false;
    this.scene.pauseOnBlur = false;
    loadFont('Monogram', monogram);

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(this.width / 2 - 160, this.height / 2 - 25, 320, 50);

    const { width } = this.cameras.main;
    const { height } = this.cameras.main;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        fontSize: '20px',
        fill: '#ffffff',
        fontFamily: 'Cyberpunks, monospace',
      },
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        fontSize: '18px',
        fill: '#ffffff',
        fontFamily: 'Cyberpunks, monospace',
      },
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.image('background', background);
    this.load.image('bgTree_1', bgTree1);
    this.load.image('bgTree_2', bgTree2);
    this.load.image('bgTree_3', bgTree3);
    this.load.image('bgTree_4', bgTree4);
    this.load.image('floor', floor);
    this.load.image('platform', platform);
    this.load.image('wallet', playBtn);
    this.load.image('play', playBtn);
    this.load.image('exit', exitBtn);
    this.load.image('play_red', playRed);
    this.load.image('exit_red', exitRed);
    this.load.image('playPressed', playPressed);
    this.load.image('exitPressed', exitPressed);
    this.load.image('instructions_bg', instructionBg);
    this.load.image('spike', spikeCollection);

    this.load.spritesheet('player', player, {
      frameWidth: 46.298,
      frameHeight: 64,
    });

    this.load.spritesheet('player_rest', playerRest, {
      frameWidth: 99,
      frameHeight: 99,
    });

    this.load.spritesheet('player_jump', playerJump, {
      frameWidth: 73.288,
      frameHeight: 91,
    });

    this.load.spritesheet('player_falling', playerFalling, {
      frameWidth: 79.761,
      frameHeight: 86,
    });

    this.load.spritesheet('player_attack', playerAttack, {
      frameWidth: 67.025,
      frameHeight: 75,
    });

    this.load.spritesheet('player_dead', playerDead, {
      frameWidth: 85.857,
      frameHeight: 73,
    });

    this.load.spritesheet('skeleton_walk', skeletonWalk, {
      frameWidth: 29.743,
      frameHeight: 80,
    });

    this.load.spritesheet('skeleton_attack', skeletonAttack, {
      frameWidth: 49.536,
      frameHeight: 66,
    });

    this.load.spritesheet('skeleton_dead', skeletonDead, {
      frameWidth: 68.197,
      frameHeight: 64,
    });

    this.load.audio('menu', menu);
    this.load.audio('gameMusic', gameMusic);
    this.load.audio('ending', ending);
    this.load.audio('death_sound', deathSound);
    this.load.audio('gameover', gameover);

    this.load.on('progress', (value) => {
      progressBar.clear();
      percentText.setText(`${parseInt(value * 100, 10)}%`);
      progressBar.fillStyle(0x00cccc, 1);
      progressBar.fillRect(625 - 150, 362.5 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }

  create() {
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 6,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'dead',
      frames: this.anims.generateFrameNumbers('player_dead', {
        start: 0,
        end: 4,
      }),
      frameRate: 4,
    });

    this.anims.create({
      key: 'rest',
      frames: this.anims.generateFrameNumbers('player_rest', {
        start: 0,
        end: 2,
      }),
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player_jump', {
        start: 0,
        end: 6,
      }),
      frameRate: 8,
    });

    this.anims.create({
      key: 'falling',
      frames: this.anims.generateFrameNumbers('player_falling', {
        start: 0,
        end: 4,
      }),
      frameRate: 7,
    });

    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('player_attack', {
        start: 0,
        end: 5,
      }),
      frameRate: 15,
    });

    this.anims.create({
      key: 'skeleton_walking',
      frames: this.anims.generateFrameNumbers('skeleton_walk', {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'skeleton_attacking',
      frames: this.anims.generateFrameNumbers('skeleton_attack', {
        start: 0,
        end: 2,
      }),
      frameRate: 15,
    });

    this.anims.create({
      key: 'skeleton_death',
      frames: this.anims.generateFrameNumbers('skeleton_dead', {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.scene.start('title-screen');
  }
}
