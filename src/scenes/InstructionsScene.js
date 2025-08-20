import Phaser from 'phaser';

export default class Instructions extends Phaser.Scene {
  constructor() {
    super('instructions');
  }

  preload() {
    this.width = this.scale.width;
    this.height = this.scale.height;
  }

  create() {
    this.cameras.main.fadeIn(1000, 255, 255, 255);

    this.bg = this.add.sprite(0, 0, 'instructions_bg').setOrigin(0, 0);
    this.bg.setDisplaySize(this.width, this.height);

    const topIns = this.make.text({
      x: this.width / 2,
      y: 150,
      text: 'You are a runner in a neon city that never sleeps. Deadly electric cones, the plagued , and deadly footholds hunt you at every turn.',
      style: {
        fontSize: '30px',
        fill: '#FFFFFF',
        fontFamily: 'RubikGlitch',
        align: 'justify',
        wordWrap: { width: this.width - 205 },
      },
    });
    topIns.setOrigin(0.5, 0.5);

    // const endless = this.make.text({
    //   x: this.width - 335,
    //   y: 172,
    //   text: 'Endless Forest',
    //   style: {
    //     fontSize: '45px',
    //     fill: '#ff0000',
    //     fontFamily: 'Monogram, monospace',
    //   },
    // });
    // endless.setOrigin(0.5, 0.5);

    const nextLine1 = this.make.text({
      x: this.width / 2,
      y: 255,
      text: 'Your only chance is to fight, dodge, and keep moving forward.In this city, stopping is the end.',
      style: {
        fontSize: '30px',
        fill: '#FFFFFF',
        fontFamily: 'RubikGlitch',
        align: 'justify',
        wordWrap: { width: this.width - 205, useAdvancedWrap: true },
      },
    });
    nextLine1.setOrigin(0.5, 0.5);

    const title = this.make.text({
      x: this.width / 2,
      y: 315,
      text: 'Controls',
      style: {
        fontSize: '60px',
        fill: '#FFFFFF',
        fontFamily: 'RubikGlitch',
      },
    });
    title.setOrigin(0.5, 0.5);

    const nextLine2 = this.make.text({
      x: this.width / 2 - 45,
      y: 370,
      text: "W / SPACE → Jump",
      style: {
        fontSize: '30px',
        fill: '#FFFFFF',
        fontFamily: 'RubikGlitch',
        align: 'justify',
        wordWrap: { width: this.width - 205, useAdvancedWrap: true },
      },
    });
    nextLine2.setOrigin(0.5, 0.5);

    const nextLine3 = this.make.text({
      x: this.width / 2 - 45,
      y: 445,
      text: "A / LEFT CLICK → Attack",
      style: {
        fontSize: '30px',
        fill: '#FFFFFF',
        fontFamily: 'RubikGlitch',
        align: 'justify',
        wordWrap: { width: this.width - 300 },
      },
    });
    nextLine3.setOrigin(0.5, 0.5);

    const nextLine4 = this.make.text({
      x: this.width / 2 - 10,
      y: 545,
      text: "S / RIGHT CLICK → For Faster",
      style: {
        fontSize: '30px',
        fill: '#FFFFFF',
        fontFamily: 'RubikGlitch',
        align: 'justify',
        wordWrap: { width: this.width - 255, useAdvancedWrap: true },
      },
    });
    nextLine4.setOrigin(0.5, 0.5);

    const cont = this.make.text({
      x: this.width / 2 - 10,
      y: 640,
      text: "[ Press SPACE to continue... ]",
      style: {
        fontSize: '30px',
        fill: '#505050',
        fontFamily: 'RubikGlitch',
        align: 'justify',
        wordWrap: { width: this.width - 255, useAdvancedWrap: true },
      },
    });
    cont.setOrigin(0.5, 0.5);

    ['A', 'S', 'SPACE', 'ENTER'].forEach(key => {
      const keyP = this.input.keyboard.addKey(key);
      keyP.on('down', () => {
        this.cameras.main.fadeOut(2000, 255, 255, 255);
        this.scene.start('game-start');
      });
    });
  }
}