'use client';

import { useEffect, useRef, useState } from 'react';
import { useSwarmVilleStore } from '@/lib/store';

// Game constants
const TILE_SIZE = 32;
const OFFICE_WIDTH = 24;
const OFFICE_HEIGHT = 16;

// Colorful palette
const COLORS = {
  floor1: 0xfff8e7,
  floor2: 0xffe4c4,
  wall: 0x8b5a2b,
  wallLight: 0xcd853f,
  desk: 0xdeb887,
  deskDark: 0xcd853f,
  plant: 0x2ecc71,
  plantDark: 0x27ae60,
  coral: 0xff6b6b,
  mint: 0x4ecdc4,
  purple: 0x9b59b6,
  blue: 0x3498db,
  yellow: 0xf1c40f,
  orange: 0xe67e22,
  pink: 0xe91e63,
  carpet: 0x9b59b6,
  carpetLight: 0xbb8fce,
};

interface GameCanvasProps {
  isEmpty?: boolean;
}

export default function GameCanvas({ isEmpty = false }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { agents, agentStates, selectedAgentId, setSelectedAgentId } = useSwarmVilleStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initPhaser = async () => {
      const Phaser = (await import('phaser')).default;

      if (gameRef.current || !containerRef.current) return;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        backgroundColor: '#87CEEB',
        pixelArt: true,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: {
          preload: preload,
          create: create,
          update: update,
        },
      };

      gameRef.current = new Phaser.Game(config);

      (gameRef.current as Phaser.Game & { swarmville: unknown }).swarmville = {
        agents: isEmpty ? [] : agents,
        agentStates,
        selectedAgentId,
        setSelectedAgentId,
        isEmpty,
      };

      setIsLoaded(true);
    };

    initPhaser();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gameRef.current) {
      (gameRef.current as Phaser.Game & { swarmville: { agents: unknown; agentStates: unknown; selectedAgentId: unknown } }).swarmville = {
        ...((gameRef.current as Phaser.Game & { swarmville: object }).swarmville || {}),
        agents,
        agentStates,
        selectedAgentId,
      };
    }
  }, [agents, agentStates, selectedAgentId]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] pixel-render">
      {!isLoaded && (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-200 to-sky-100">
          <div className="text-amber-800 pixel-text">INITIALIZING OFFICE...</div>
        </div>
      )}
    </div>
  );
}

function preload(this: Phaser.Scene) {}

function create(this: Phaser.Scene) {
  const { width, height } = this.scale;
  const offsetX = (width - OFFICE_WIDTH * TILE_SIZE) / 2;
  const offsetY = (height - OFFICE_HEIGHT * TILE_SIZE) / 2;

  // Sky gradient background
  const skyGradient = this.add.graphics();
  skyGradient.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xb0e0e6, 0xb0e0e6, 1);
  skyGradient.fillRect(0, 0, width, height);

  // Ground/grass outside office
  this.add.rectangle(width / 2, height, width, height * 0.3, 0x90ee90).setOrigin(0.5, 1);

  // Main floor
  for (let y = 0; y < OFFICE_HEIGHT; y++) {
    for (let x = 0; x < OFFICE_WIDTH; x++) {
      const tileX = offsetX + x * TILE_SIZE;
      const tileY = offsetY + y * TILE_SIZE;
      const isLight = (x + y) % 2 === 0;

      // Carpet area in center
      const isCarpet = x >= 8 && x <= 15 && y >= 5 && y <= 10;

      let floorColor = isLight ? COLORS.floor1 : COLORS.floor2;
      if (isCarpet) {
        floorColor = isLight ? COLORS.carpetLight : COLORS.carpet;
      }

      this.add.rectangle(
        tileX + TILE_SIZE / 2,
        tileY + TILE_SIZE / 2,
        TILE_SIZE - 1,
        TILE_SIZE - 1,
        floorColor
      ).setStrokeStyle(1, isCarpet ? 0x8e44ad : 0xe8dcc8);
    }
  }

  // Walls with windows
  drawWalls(this, offsetX, offsetY);

  // Workstations (colorful cubicles)
  const workstations = [
    { x: 2, y: 2, color: COLORS.coral },
    { x: 2, y: 5, color: COLORS.mint },
    { x: 2, y: 8, color: COLORS.blue },
    { x: 2, y: 11, color: COLORS.orange },
    { x: 5, y: 2, color: COLORS.purple },
    { x: 5, y: 5, color: COLORS.yellow },
    { x: 5, y: 8, color: COLORS.pink },
    { x: 5, y: 11, color: COLORS.mint },
  ];

  workstations.forEach((ws, i) => {
    drawColorfulWorkstation(this, offsetX + ws.x * TILE_SIZE, offsetY + ws.y * TILE_SIZE, ws.color, i);
  });

  // Break room with colorful furniture
  drawBreakRoom(this, offsetX + 17 * TILE_SIZE, offsetY + 2 * TILE_SIZE);

  // Meeting room with colorful elements
  drawMeetingRoom(this, offsetX + 17 * TILE_SIZE, offsetY + 9 * TILE_SIZE);

  // Manager's office (center-top)
  drawManagerOffice(this, offsetX + 10 * TILE_SIZE, offsetY + 1 * TILE_SIZE);

  // Plants everywhere (colorful pots)
  const plantPositions = [
    { x: 1, y: 1, color: COLORS.coral },
    { x: 1, y: 13, color: COLORS.mint },
    { x: 8, y: 1, color: COLORS.yellow },
    { x: 15, y: 1, color: COLORS.purple },
    { x: 22, y: 1, color: COLORS.orange },
    { x: 22, y: 7, color: COLORS.blue },
    { x: 22, y: 13, color: COLORS.pink },
    { x: 9, y: 13, color: COLORS.coral },
    { x: 14, y: 13, color: COLORS.mint },
  ];

  plantPositions.forEach((p) => {
    drawColorfulPlant(this, offsetX + p.x * TILE_SIZE, offsetY + p.y * TILE_SIZE, p.color);
  });

  // Water cooler
  drawWaterCooler(this, offsetX + 16 * TILE_SIZE, offsetY + 7 * TILE_SIZE);

  // Vending machine
  drawVendingMachine(this, offsetX + 16 * TILE_SIZE, offsetY + 10 * TILE_SIZE);

  // Create agent sprites
  const game = this.game as Phaser.Game & { swarmville: { agents: Array<{ id: string; name: string; avatar_style: { clothing_color: string }; is_manager?: boolean }> } };
  const agentsData = game.swarmville?.agents || [];

  agentsData.forEach((agent, index) => {
    if (agent.is_manager) {
      // Manager in their office
      createPixelAgent(this, offsetX + 12 * TILE_SIZE, offsetY + 3 * TILE_SIZE, agent, true);
    } else {
      const ws = workstations[index % workstations.length];
      if (ws) {
        createPixelAgent(this, offsetX + (ws.x + 1.5) * TILE_SIZE, offsetY + (ws.y + 1.5) * TILE_SIZE, agent, false);
      }
    }
  });

  (this as Phaser.Scene & { offsets: { x: number; y: number } }).offsets = { x: offsetX, y: offsetY };
}

function update(this: Phaser.Scene) {}

function drawWalls(scene: Phaser.Scene, offsetX: number, offsetY: number) {
  const wallHeight = TILE_SIZE * 1.5;

  // Main wall
  scene.add.rectangle(
    offsetX + OFFICE_WIDTH * TILE_SIZE / 2,
    offsetY - wallHeight / 2,
    OFFICE_WIDTH * TILE_SIZE,
    wallHeight,
    COLORS.wall
  ).setStrokeStyle(3, 0x5d3a1a);

  // Windows
  for (let i = 0; i < 6; i++) {
    const windowX = offsetX + (3 + i * 4) * TILE_SIZE;
    // Window frame
    scene.add.rectangle(windowX, offsetY - wallHeight / 2, TILE_SIZE * 1.5, TILE_SIZE, 0x87ceeb)
      .setStrokeStyle(3, 0xffffff);
    // Window reflection
    scene.add.rectangle(windowX - 8, offsetY - wallHeight / 2 - 5, 4, TILE_SIZE * 0.6, 0xffffff, 0.4);
  }

  // Side walls
  scene.add.rectangle(
    offsetX - TILE_SIZE / 4,
    offsetY + OFFICE_HEIGHT * TILE_SIZE / 2,
    TILE_SIZE / 2,
    OFFICE_HEIGHT * TILE_SIZE,
    COLORS.wallLight
  );
  scene.add.rectangle(
    offsetX + OFFICE_WIDTH * TILE_SIZE + TILE_SIZE / 4,
    offsetY + OFFICE_HEIGHT * TILE_SIZE / 2,
    TILE_SIZE / 2,
    OFFICE_HEIGHT * TILE_SIZE,
    COLORS.wallLight
  );
}

function drawColorfulWorkstation(scene: Phaser.Scene, x: number, y: number, accentColor: number, _index: number) {
  // Desk
  scene.add.rectangle(x + TILE_SIZE * 1.5, y + TILE_SIZE, TILE_SIZE * 2.2, TILE_SIZE * 0.8, COLORS.desk)
    .setStrokeStyle(2, COLORS.deskDark);

  // Desk accent strip
  scene.add.rectangle(x + TILE_SIZE * 1.5, y + TILE_SIZE - TILE_SIZE * 0.3, TILE_SIZE * 2.2, TILE_SIZE * 0.15, accentColor);

  // Monitor
  scene.add.rectangle(x + TILE_SIZE * 1.5, y + TILE_SIZE * 0.5, TILE_SIZE * 0.8, TILE_SIZE * 0.6, 0x2c3e50)
    .setStrokeStyle(2, 0x1a252f);
  // Screen glow
  scene.add.rectangle(x + TILE_SIZE * 1.5, y + TILE_SIZE * 0.5, TILE_SIZE * 0.65, TILE_SIZE * 0.45, accentColor);

  // Keyboard
  scene.add.rectangle(x + TILE_SIZE * 1.5, y + TILE_SIZE * 0.9, TILE_SIZE * 0.6, TILE_SIZE * 0.15, 0x2c3e50);

  // Chair
  scene.add.ellipse(x + TILE_SIZE * 1.5, y + TILE_SIZE * 1.8, TILE_SIZE * 0.7, TILE_SIZE * 0.5, accentColor)
    .setStrokeStyle(2, 0x2c3e50);

  // Small items (coffee mug, pen holder)
  scene.add.circle(x + TILE_SIZE * 2.3, y + TILE_SIZE * 0.7, 5, 0xffffff).setStrokeStyle(1, accentColor);
  scene.add.rectangle(x + TILE_SIZE * 0.7, y + TILE_SIZE * 0.7, 8, 12, accentColor);
}

function drawBreakRoom(scene: Phaser.Scene, x: number, y: number) {
  // Floor accent
  for (let dy = 0; dy < 5; dy++) {
    for (let dx = 0; dx < 5; dx++) {
      const isLight = (dx + dy) % 2 === 0;
      scene.add.rectangle(
        x + dx * TILE_SIZE + TILE_SIZE / 2,
        y + dy * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE - 1,
        TILE_SIZE - 1,
        isLight ? 0xffeaa7 : 0xfdcb6e
      ).setStrokeStyle(1, 0xf39c12);
    }
  }

  // Label
  scene.add.text(x + 2.5 * TILE_SIZE, y - 5, 'BREAK ROOM', {
    fontSize: '10px',
    color: '#e67e22',
    fontStyle: 'bold',
    fontFamily: 'monospace',
  }).setOrigin(0.5, 1);

  // Colorful couch
  scene.add.rectangle(x + 2.5 * TILE_SIZE, y + 1.5 * TILE_SIZE, TILE_SIZE * 3, TILE_SIZE * 0.8, COLORS.coral)
    .setStrokeStyle(2, 0xc0392b);

  // Coffee table
  scene.add.rectangle(x + 2.5 * TILE_SIZE, y + 2.8 * TILE_SIZE, TILE_SIZE * 2, TILE_SIZE * 0.6, COLORS.desk)
    .setStrokeStyle(2, COLORS.deskDark);

  // Colorful bean bags
  scene.add.ellipse(x + 1 * TILE_SIZE, y + 4 * TILE_SIZE, TILE_SIZE * 0.8, TILE_SIZE * 0.6, COLORS.mint);
  scene.add.ellipse(x + 4 * TILE_SIZE, y + 4 * TILE_SIZE, TILE_SIZE * 0.8, TILE_SIZE * 0.6, COLORS.purple);

  // Snacks on table
  scene.add.circle(x + 2 * TILE_SIZE, y + 2.8 * TILE_SIZE, 6, COLORS.yellow);
  scene.add.circle(x + 3 * TILE_SIZE, y + 2.8 * TILE_SIZE, 6, COLORS.pink);
}

function drawMeetingRoom(scene: Phaser.Scene, x: number, y: number) {
  // Floor
  for (let dy = 0; dy < 5; dy++) {
    for (let dx = 0; dx < 5; dx++) {
      const isLight = (dx + dy) % 2 === 0;
      scene.add.rectangle(
        x + dx * TILE_SIZE + TILE_SIZE / 2,
        y + dy * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE - 1,
        TILE_SIZE - 1,
        isLight ? 0xd5f5e3 : 0xabebc6
      ).setStrokeStyle(1, 0x27ae60);
    }
  }

  // Label
  scene.add.text(x + 2.5 * TILE_SIZE, y - 5, 'MEETING ROOM', {
    fontSize: '10px',
    color: '#27ae60',
    fontStyle: 'bold',
    fontFamily: 'monospace',
  }).setOrigin(0.5, 1);

  // Conference table
  scene.add.rectangle(x + 2.5 * TILE_SIZE, y + 2.5 * TILE_SIZE, TILE_SIZE * 3.5, TILE_SIZE * 1.5, 0x5d4e37)
    .setStrokeStyle(3, 0x3d2817);

  // Chairs around table
  const chairPositions = [
    { dx: 0.5, dy: 2.5 }, { dx: 4.5, dy: 2.5 },
    { dx: 1.5, dy: 1.2 }, { dx: 3.5, dy: 1.2 },
    { dx: 1.5, dy: 3.8 }, { dx: 3.5, dy: 3.8 },
  ];
  const chairColors = [COLORS.coral, COLORS.mint, COLORS.blue, COLORS.yellow, COLORS.purple, COLORS.orange];
  chairPositions.forEach((pos, i) => {
    scene.add.ellipse(x + pos.dx * TILE_SIZE, y + pos.dy * TILE_SIZE, TILE_SIZE * 0.5, TILE_SIZE * 0.4, chairColors[i]);
  });

  // Whiteboard
  scene.add.rectangle(x + 2.5 * TILE_SIZE, y + 0.3 * TILE_SIZE, TILE_SIZE * 2.5, TILE_SIZE * 0.5, 0xffffff)
    .setStrokeStyle(2, 0x7f8c8d);
}

function drawManagerOffice(scene: Phaser.Scene, x: number, y: number) {
  // Special floor
  for (let dy = 0; dy < 3; dy++) {
    for (let dx = 0; dx < 4; dx++) {
      const isLight = (dx + dy) % 2 === 0;
      scene.add.rectangle(
        x + dx * TILE_SIZE + TILE_SIZE / 2,
        y + dy * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE - 1,
        TILE_SIZE - 1,
        isLight ? 0xf5b7b1 : 0xf1948a
      ).setStrokeStyle(1, 0xe74c3c);
    }
  }

  // Label with crown
  scene.add.text(x + 2 * TILE_SIZE, y - 5, 'MANAGER', {
    fontSize: '10px',
    color: '#c0392b',
    fontStyle: 'bold',
    fontFamily: 'monospace',
  }).setOrigin(0.5, 1);

  // Executive desk
  scene.add.rectangle(x + 2 * TILE_SIZE, y + 1.5 * TILE_SIZE, TILE_SIZE * 2.5, TILE_SIZE * 1, 0x5d4e37)
    .setStrokeStyle(3, 0x3d2817);

  // Large monitor
  scene.add.rectangle(x + 2 * TILE_SIZE, y + 0.8 * TILE_SIZE, TILE_SIZE * 1, TILE_SIZE * 0.7, 0x2c3e50)
    .setStrokeStyle(2, 0x1a252f);
  scene.add.rectangle(x + 2 * TILE_SIZE, y + 0.8 * TILE_SIZE, TILE_SIZE * 0.85, TILE_SIZE * 0.55, COLORS.purple);

  // Executive chair
  scene.add.ellipse(x + 2 * TILE_SIZE, y + 2.5 * TILE_SIZE, TILE_SIZE * 0.9, TILE_SIZE * 0.7, 0xc0392b)
    .setStrokeStyle(2, 0x922b21);

  // Nameplate
  scene.add.rectangle(x + 2 * TILE_SIZE, y + 1.2 * TILE_SIZE, TILE_SIZE * 0.8, TILE_SIZE * 0.2, COLORS.yellow);
}

function drawColorfulPlant(scene: Phaser.Scene, x: number, y: number, potColor: number) {
  // Pot
  scene.add.rectangle(x + TILE_SIZE / 2, y + TILE_SIZE * 0.8, TILE_SIZE * 0.5, TILE_SIZE * 0.4, potColor)
    .setStrokeStyle(2, 0x2c3e50);

  // Plant
  const leaves = scene.add.graphics();
  leaves.fillStyle(COLORS.plant);
  leaves.fillCircle(x + TILE_SIZE / 2, y + TILE_SIZE * 0.35, TILE_SIZE * 0.35);
  leaves.fillStyle(COLORS.plantDark);
  leaves.fillCircle(x + TILE_SIZE * 0.35, y + TILE_SIZE * 0.45, TILE_SIZE * 0.25);
  leaves.fillCircle(x + TILE_SIZE * 0.65, y + TILE_SIZE * 0.45, TILE_SIZE * 0.25);
}

function drawWaterCooler(scene: Phaser.Scene, x: number, y: number) {
  // Base
  scene.add.rectangle(x + TILE_SIZE / 2, y + TILE_SIZE * 0.7, TILE_SIZE * 0.6, TILE_SIZE * 0.6, 0xecf0f1)
    .setStrokeStyle(2, 0xbdc3c7);
  // Water bottle
  scene.add.rectangle(x + TILE_SIZE / 2, y + TILE_SIZE * 0.2, TILE_SIZE * 0.4, TILE_SIZE * 0.5, 0x3498db, 0.7)
    .setStrokeStyle(1, 0x2980b9);
}

function drawVendingMachine(scene: Phaser.Scene, x: number, y: number) {
  // Body
  scene.add.rectangle(x + TILE_SIZE / 2, y + TILE_SIZE * 0.5, TILE_SIZE * 0.8, TILE_SIZE, COLORS.coral)
    .setStrokeStyle(2, 0xc0392b);
  // Display
  scene.add.rectangle(x + TILE_SIZE / 2, y + TILE_SIZE * 0.3, TILE_SIZE * 0.6, TILE_SIZE * 0.4, 0x2c3e50);
  // Items (colorful squares)
  scene.add.rectangle(x + TILE_SIZE * 0.35, y + TILE_SIZE * 0.25, 6, 6, COLORS.yellow);
  scene.add.rectangle(x + TILE_SIZE * 0.5, y + TILE_SIZE * 0.25, 6, 6, COLORS.mint);
  scene.add.rectangle(x + TILE_SIZE * 0.65, y + TILE_SIZE * 0.25, 6, 6, COLORS.purple);
  scene.add.rectangle(x + TILE_SIZE * 0.35, y + TILE_SIZE * 0.4, 6, 6, COLORS.orange);
  scene.add.rectangle(x + TILE_SIZE * 0.5, y + TILE_SIZE * 0.4, 6, 6, COLORS.blue);
  scene.add.rectangle(x + TILE_SIZE * 0.65, y + TILE_SIZE * 0.4, 6, 6, COLORS.pink);
}

function createPixelAgent(
  scene: Phaser.Scene,
  x: number,
  y: number,
  agent: { id: string; name: string; avatar_style: { clothing_color: string } },
  isManager: boolean
) {
  const container = scene.add.container(x, y);
  const clothingColor = parseInt(agent.avatar_style.clothing_color.replace('#', ''), 16);

  // Shadow
  scene.add.ellipse(x, y + TILE_SIZE * 0.3, TILE_SIZE * 0.6, TILE_SIZE * 0.2, 0x000000, 0.2);

  // Body
  const body = scene.add.rectangle(0, 0, TILE_SIZE * 0.5, TILE_SIZE * 0.6, clothingColor);
  body.setStrokeStyle(2, 0x2c3e50);

  // Head
  const head = scene.add.circle(0, -TILE_SIZE * 0.45, TILE_SIZE * 0.25, 0xffdab9);
  head.setStrokeStyle(2, 0xdeb887);

  // Hair
  const hairColor = isManager ? 0x2c1810 : (clothingColor & 0xff0000) > 0x800000 ? 0x2c1810 : 0x8b4513;
  scene.add.ellipse(0, -TILE_SIZE * 0.6, TILE_SIZE * 0.4, TILE_SIZE * 0.25, hairColor);

  // Eyes
  scene.add.circle(-5, -TILE_SIZE * 0.45, 3, 0x2c3e50);
  scene.add.circle(5, -TILE_SIZE * 0.45, 3, 0x2c3e50);
  scene.add.circle(-5, -TILE_SIZE * 0.46, 1, 0xffffff);
  scene.add.circle(5, -TILE_SIZE * 0.46, 1, 0xffffff);

  // Smile
  const smile = scene.add.graphics();
  smile.lineStyle(2, 0x8b4513);
  smile.arc(0, -TILE_SIZE * 0.38, 5, 0.2, Math.PI - 0.2);
  smile.strokePath();

  // Crown for manager
  if (isManager) {
    const crown = scene.add.graphics();
    crown.fillStyle(0xf1c40f);
    crown.fillRect(-10, -TILE_SIZE * 0.85, 20, 8);
    crown.fillTriangle(-10, -TILE_SIZE * 0.85, -5, -TILE_SIZE, 0, -TILE_SIZE * 0.85);
    crown.fillTriangle(0, -TILE_SIZE * 0.85, 5, -TILE_SIZE, 10, -TILE_SIZE * 0.85);
    container.add(crown);
  }

  container.add([body, head]);

  // Name tag
  const nameTag = scene.add.text(0, TILE_SIZE * 0.5, agent.name.slice(0, 8), {
    fontSize: '9px',
    color: '#2c3e50',
    backgroundColor: '#ffffff',
    padding: { x: 3, y: 1 },
    fontFamily: 'monospace',
  }).setOrigin(0.5, 0);
  container.add(nameTag);

  // Interactive
  body.setInteractive({ useHandCursor: true });
  body.on('pointerdown', () => {
    const game = scene.game as Phaser.Game & { swarmville: { setSelectedAgentId: (id: string) => void } };
    game.swarmville?.setSelectedAgentId(agent.id);
  });
  body.on('pointerover', () => {
    container.setScale(1.1);
  });
  body.on('pointerout', () => {
    container.setScale(1);
  });

  (container as Phaser.GameObjects.Container & { agentId: string }).agentId = agent.id;
  return container;
}
