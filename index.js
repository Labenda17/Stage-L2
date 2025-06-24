import React, { useState, useEffect, useRef } from 'react';
import { Calculator, ArrowRight, Info, Settings, Zap, Waves } from 'lucide-react';

const ElectromagneticFieldCalculator = () => {
  const canvasRef = useRef(null);
  
  const [inputMode, setInputMode] = useState('electric');
  const [fieldEquations, setFieldEquations] = useState({
    Ex: '1.0',
    Ey: '0',
    Ez: '0',
    Bx: '0',
    By: '0', 
    Bz: '0'
  });
  
  // Module créateur d'exemples personnalisés
  const [customExamples, setCustomExamples] = useState([]);
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [newExample, setNewExample] = useState({
    name: '',
    description: '',
    Ex: '0', Ey: '0', Ez: '0',
    Bx: '0', By: '0', Bz: '0',
    propagationAxis: 'z',
    inputMode: 'electric'
  });
  
  // Constantes physiques fixes - Valeurs du TD LSPh411N
  const CONSTANTS = {
    c: 299792458, // m/s
    mu0: 4e-7 * Math.PI, // H/m
    epsilon0: 8.854187817e-12, // F/m
    Z0: 376.730313668, // Ω
    omega: 2 * Math.PI * 2.5e9 // rad/s - f = 2.5 GHz (TD question 2a.4)
  };
  
  const [parameters, setParameters] = useState({
    k: CONSTANTS.omega / CONSTANTS.c
  });
  
  // Contrôles de visualisation
  const [visualizationControls, setVisualizationControls] = useState({
    magneticScale: 1e12, // Échelle pour rendre B très visible
    showMagneticField: true,
    showElectricField: true,
    magneticThickness: 6,
    electricThickness: 4
  });
  
  const [propagationAxis, setPropagationAxis] = useState('z');
  const [calculatedFields, setCalculatedFields] = useState({
    Ex: '', Ey: '', Ez: '',
    Bx: '', By: '', Bz: ''
  });
  
  const [waveProperties, setWaveProperties] = useState({
    frequency: 0,
    wavelength: 0,
    period: 0,
    phase_velocity: 0,
    impedance: 376.730313668,
    energy_density: 0
  });

  const [results, setResults] = useState({
    isValidWave: true,
    polarization: 'Linéaire',
    direction: 'z',
    analysis: 'Onde plane statique'
  });

  const safeEvaluate = (expr, vars = {}) => {
    if (!expr || expr === '0' || expr.trim() === '') return 0;
    
    try {
      // Si c'est juste un nombre, le retourner directement
      const num = parseFloat(expr);
      if (!isNaN(num)) return num;
      
      let expression = expr.toString();
      
      // Remplacer les variables de base
      expression = expression.replace(/\bx\b/g, vars.x || 0);
      expression = expression.replace(/\by\b/g, vars.y || 0);
      expression = expression.replace(/\bz\b/g, vars.z || 0);
      expression = expression.replace(/\bt\b/g, vars.t || 0);
      
      // Fonctions mathématiques
      expression = expression.replace(/cos/g, 'Math.cos');
      expression = expression.replace(/sin/g, 'Math.sin');
      expression = expression.replace(/\bpi\b/g, 'Math.PI');
      
      const result = Function(`"use strict"; return (${expression})`)();
      return isNaN(result) || !isFinite(result) ? 0 : result;
    } catch (error) {
      console.warn('Erreur d\'évaluation:', error.message);
      return 0;
    }
  };

  const calculateMagneticFromElectric = () => {
    const { k } = parameters;
    const { omega } = CONSTANTS;
    
    try {
      let newFields = { Bx: '0', By: '0', Bz: '0' };
      
      // Relation B = (k × E) / ω
      if (propagationAxis === 'z') {
        // k = k*ẑ, donc k × E = k(Ex*ŷ - Ey*x̂)
        if (fieldEquations.Ex && fieldEquations.Ex !== '0') {
          const Ex_val = safeEvaluate(fieldEquations.Ex);
          newFields.By = (k / omega * Ex_val).toFixed(8);
        }
        if (fieldEquations.Ey && fieldEquations.Ey !== '0') {
          const Ey_val = safeEvaluate(fieldEquations.Ey);
          newFields.Bx = (-k / omega * Ey_val).toFixed(8);
        }
      } else if (propagationAxis === 'x') {
        // k = k*x̂, donc k × E = k(Ey*ẑ - Ez*ŷ)
        if (fieldEquations.Ey && fieldEquations.Ey !== '0') {
          const Ey_val = safeEvaluate(fieldEquations.Ey);
          newFields.Bz = (k / omega * Ey_val).toFixed(8);
        }
        if (fieldEquations.Ez && fieldEquations.Ez !== '0') {
          const Ez_val = safeEvaluate(fieldEquations.Ez);
          newFields.By = (-k / omega * Ez_val).toFixed(8);
        }
      } else if (propagationAxis === 'y') {
        // k = k*ŷ, donc k × E = k(Ez*x̂ - Ex*ẑ)
        if (fieldEquations.Ez && fieldEquations.Ez !== '0') {
          const Ez_val = safeEvaluate(fieldEquations.Ez);
          newFields.Bx = (k / omega * Ez_val).toFixed(8);
        }
        if (fieldEquations.Ex && fieldEquations.Ex !== '0') {
          const Ex_val = safeEvaluate(fieldEquations.Ex);
          newFields.Bz = (-k / omega * Ex_val).toFixed(8);
        }
      }
      
      setCalculatedFields(prev => ({
        ...prev,
        Bx: newFields.Bx,
        By: newFields.By,
        Bz: newFields.Bz
      }));
    } catch (error) {
      console.error('Erreur calcul B:', error);
    }
  };

  const calculateElectricFromMagnetic = () => {
    const { c } = CONSTANTS;
    
    try {
      let newFields = { Ex: '0', Ey: '0', Ez: '0' };
      
      // Relation E = c(B × k̂)
      if (propagationAxis === 'z') {
        // k̂ = ẑ, donc B × k̂ = Bx*ŷ - By*x̂
        if (fieldEquations.Bx && fieldEquations.Bx !== '0') {
          const Bx_val = safeEvaluate(fieldEquations.Bx);
          newFields.Ey = (-c * Bx_val).toFixed(2);
        }
        if (fieldEquations.By && fieldEquations.By !== '0') {
          const By_val = safeEvaluate(fieldEquations.By);
          newFields.Ex = (c * By_val).toFixed(2);
        }
      } else if (propagationAxis === 'x') {
        // k̂ = x̂, donc B × k̂ = By*ẑ - Bz*ŷ
        if (fieldEquations.By && fieldEquations.By !== '0') {
          const By_val = safeEvaluate(fieldEquations.By);
          newFields.Ez = (-c * By_val).toFixed(2);
        }
        if (fieldEquations.Bz && fieldEquations.Bz !== '0') {
          const Bz_val = safeEvaluate(fieldEquations.Bz);
          newFields.Ey = (c * Bz_val).toFixed(2);
        }
      } else if (propagationAxis === 'y') {
        // k̂ = ŷ, donc B × k̂ = Bz*x̂ - Bx*ẑ
        if (fieldEquations.Bz && fieldEquations.Bz !== '0') {
          const Bz_val = safeEvaluate(fieldEquations.Bz);
          newFields.Ex = (-c * Bz_val).toFixed(2);
        }
        if (fieldEquations.Bx && fieldEquations.Bx !== '0') {
          const Bx_val = safeEvaluate(fieldEquations.Bx);
          newFields.Ez = (c * Bx_val).toFixed(2);
        }
      }
      
      setCalculatedFields(prev => ({
        ...prev,
        Ex: newFields.Ex,
        Ey: newFields.Ey,
        Ez: newFields.Ez
      }));
    } catch (error) {
      console.error('Erreur calcul E:', error);
    }
  };

  const analyzeWaveProperties = () => {
    const { omega } = CONSTANTS;
    const { k } = parameters;
    
    const frequency = omega / (2 * Math.PI);
    const wavelength = (2 * Math.PI) / k;
    const period = (2 * Math.PI) / omega;
    const phase_velocity = omega / k;
    
    // Calcul de l'amplitude E0 selon les composantes actives
    const Ex_val = safeEvaluate(inputMode === 'electric' ? fieldEquations.Ex : calculatedFields.Ex);
    const Ey_val = safeEvaluate(inputMode === 'electric' ? fieldEquations.Ey : calculatedFields.Ey);
    const Ez_val = safeEvaluate(inputMode === 'electric' ? fieldEquations.Ez : calculatedFields.Ez);
    const E_amplitude = Math.sqrt(Ex_val*Ex_val + Ey_val*Ey_val + Ez_val*Ez_val);
    
    const energy_density = 0.5 * CONSTANTS.epsilon0 * E_amplitude * E_amplitude;
    
    setWaveProperties({
      frequency,
      wavelength,
      period,
      phase_velocity,
      impedance: CONSTANTS.Z0,
      energy_density
    });
    
    // Analyse de la polarisation
    let polarization = 'Linéaire';
    if (inputMode === 'electric') {
      const hasX = fieldEquations.Ex && fieldEquations.Ex !== '0';
      const hasY = fieldEquations.Ey && fieldEquations.Ey !== '0';
      const hasZ = fieldEquations.Ez && fieldEquations.Ez !== '0';
      
      const activeComponents = [hasX, hasY, hasZ].filter(Boolean).length;
      if (activeComponents > 1) {
        polarization = 'Combinée';
      }
    }
    
    setResults({
      isValidWave: true,
      polarization,
      direction: `Propagation selon ${propagationAxis.toUpperCase()}`,
      analysis: `Champs statiques - Amplitude E = ${E_amplitude.toFixed(2)} V/m`
    });
  };

  const drawVector = (ctx, x, y, dx, dy, color, label, thickness = 3, showMagnitude = false) => {
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    
    // Corps de la flèche
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
    
    // Flèche plus visible
    const angle = Math.atan2(dy, dx);
    const arrowLength = Math.max(15, thickness * 3);
    const arrowWidth = 0.4;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx - arrowLength * Math.cos(angle - arrowWidth), 
               y + dy - arrowLength * Math.sin(angle - arrowWidth));
    ctx.lineTo(x + dx - arrowLength * Math.cos(angle + arrowWidth), 
               y + dy - arrowLength * Math.sin(angle + arrowWidth));
    ctx.closePath();
    ctx.fill();
    
    // Label avec fond pour meilleure lisibilité
    if (label) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x + dx + 5, y + dy - 20, 40, 16);
      
      ctx.fillStyle = color;
      ctx.font = 'bold 14px Arial';
      ctx.fillText(label, x + dx + 8, y + dy - 8);
      
      // Magnitude si demandée
      if (showMagnitude) {
        const magnitude = Math.sqrt(dx*dx + dy*dy);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.fillText(`${magnitude.toFixed(0)}`, x + dx + 8, y + dy + 8);
      }
    }
  };

  const renderVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Fond dégradé pour mieux voir les flèches
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Grille plus fine et contrastée
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * width;
      const y = (i / 20) * height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Points de référence pour les champs
    const centerX = width / 2;
    const centerY = height / 2;
    const offsetE = -100; // Décalage pour le champ E
    const offsetB = 100;  // Décalage pour le champ B
    
    // Échelles adaptées
    const scaleE = 80; // Échelle pour E
    const scaleB = visualizationControls.magneticScale; // Échelle très élevée pour B
    
    // Calculer les valeurs des champs
    const E = {
      x: safeEvaluate(inputMode === 'electric' ? fieldEquations.Ex : calculatedFields.Ex),
      y: safeEvaluate(inputMode === 'electric' ? fieldEquations.Ey : calculatedFields.Ey),
      z: safeEvaluate(inputMode === 'electric' ? fieldEquations.Ez : calculatedFields.Ez)
    };
    
    const B = {
      x: safeEvaluate(inputMode === 'magnetic' ? fieldEquations.Bx : calculatedFields.Bx),
      y: safeEvaluate(inputMode === 'magnetic' ? fieldEquations.By : calculatedFields.By),
      z: safeEvaluate(inputMode === 'magnetic' ? fieldEquations.Bz : calculatedFields.Bz)
    };
    
    // Dessiner les axes de référence avec labels
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    
    // Axe horizontal
    ctx.beginPath();
    ctx.moveTo(50, centerY);
    ctx.lineTo(width - 50, centerY);
    ctx.stroke();
    
    // Axe vertical
    ctx.beginPath();
    ctx.moveTo(centerX, 50);
    ctx.lineTo(centerX, height - 50);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Zones dédiées pour E et B
    ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    ctx.fillRect(centerX + offsetE - 80, centerY - 80, 160, 160);
    ctx.fillStyle = 'rgba(0, 100, 255, 0.1)';
    ctx.fillRect(centerX + offsetB - 80, centerY - 80, 160, 160);
    
    // Labels des zones
    ctx.fillStyle = '#ff6666';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('CHAMP E', centerX + offsetE - 30, centerY - 90);
    ctx.fillStyle = '#66aaff';
    ctx.fillText('CHAMP B', centerX + offsetB - 30, centerY - 90);
    
    // Visualisation selon l'axe de propagation
    if (propagationAxis === 'z') {
      // Propagation selon Z - Plan X-Y visible
      
      // Champ E (rouge vif) - zone gauche
      if (visualizationControls.showElectricField) {
        if (Math.abs(E.x) > 0.01) {
          drawVector(ctx, centerX + offsetE, centerY, 0, -E.x * scaleE, '#ff0000', 'Ex', visualizationControls.electricThickness, true);
        }
        if (Math.abs(E.y) > 0.01) {
          drawVector(ctx, centerX + offsetE, centerY, E.y * scaleE, 0, '#ff4444', 'Ey', visualizationControls.electricThickness, true);
        }
      }
      
      // Champ B (bleu brillant) - zone droite
      if (visualizationControls.showMagneticField) {
        if (Math.abs(B.x) > 1e-15) {
          drawVector(ctx, centerX + offsetB, centerY, B.x * scaleB, 0, '#0066ff', 'Bx', visualizationControls.magneticThickness, true);
        }
        if (Math.abs(B.y) > 1e-15) {
          drawVector(ctx, centerX + offsetB, centerY, 0, -B.y * scaleB, '#0099ff', 'By', visualizationControls.magneticThickness, true);
        }
      }
      
      // Labels des axes
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('X →', width - 80, centerY - 10);
      ctx.fillText('↑', centerX + 10, 70);
      ctx.fillText('Y', centerX + 10, 85);
      
    } else if (propagationAxis === 'x') {
      // Propagation selon X - Plan Y-Z visible
      
      // Champ E (rouge vif)
      if (visualizationControls.showElectricField) {
        if (Math.abs(E.y) > 0.01) {
          drawVector(ctx, centerX + offsetE, centerY, E.y * scaleE, 0, '#ff0000', 'Ey', visualizationControls.electricThickness, true);
        }
        if (Math.abs(E.z) > 0.01) {
          drawVector(ctx, centerX + offsetE, centerY, 0, -E.z * scaleE, '#ff4444', 'Ez', visualizationControls.electricThickness, true);
        }
      }
      
      // Champ B (bleu brillant)
      if (visualizationControls.showMagneticField) {
        if (Math.abs(B.y) > 1e-15) {
          drawVector(ctx, centerX + offsetB, centerY, B.y * scaleB, 0, '#0066ff', 'By', visualizationControls.magneticThickness, true);
        }
        if (Math.abs(B.z) > 1e-15) {
          drawVector(ctx, centerX + offsetB, centerY, 0, -B.z * scaleB, '#0099ff', 'Bz', visualizationControls.magneticThickness, true);
        }
      }
      
      // Labels des axes
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Y →', width - 80, centerY - 10);
      ctx.fillText('↑', centerX + 10, 70);
      ctx.fillText('Z', centerX + 10, 85);
      
    } else if (propagationAxis === 'y') {
      // Propagation selon Y - Plan X-Z visible
      
      // Champ E (rouge vif)
      if (visualizationControls.showElectricField) {
        if (Math.abs(E.x) > 0.01) {
          drawVector(ctx, centerX + offsetE, centerY, E.x * scaleE, 0, '#ff0000', 'Ex', visualizationControls.electricThickness, true);
        }
        if (Math.abs(E.z) > 0.01) {
          drawVector(ctx, centerX + offsetE, centerY, 0, -E.z * scaleE, '#ff4444', 'Ez', visualizationControls.electricThickness, true);
        }
      }
      
      // Champ B (bleu brillant)
      if (visualizationControls.showMagneticField) {
        if (Math.abs(B.x) > 1e-15) {
          drawVector(ctx, centerX + offsetB, centerY, B.x * scaleB, 0, '#0066ff', 'Bx', visualizationControls.magneticThickness, true);
        }
        if (Math.abs(B.z) > 1e-15) {
          drawVector(ctx, centerX + offsetB, centerY, 0, -B.z * scaleB, '#0099ff', 'Bz', visualizationControls.magneticThickness, true);
        }
      }
      
      // Labels des axes
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('X →', width - 80, centerY - 10);
      ctx.fillText('↑', centerX + 10, 70);
      ctx.fillText('Z', centerX + 10, 85);
    }
    
    // Informations en haut avec fond
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 400, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Propagation selon ${propagationAxis.toUpperCase()}`, 20, 35);
    
    ctx.font = '16px Arial';
    ctx.fillText(`Plan visible: ${propagationAxis === 'z' ? 'X-Y' : propagationAxis === 'x' ? 'Y-Z' : 'X-Z'}`, 20, 55);
    ctx.fillText(`Échelle B: ×${visualizationControls.magneticScale.toExponential(0)}`, 20, 75);
    
    // Légende améliorée
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, height - 80, 300, 70);
    
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(20, height - 65, 20, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText('Champ électrique E (V/m)', 50, height - 57);
    
    ctx.fillStyle = '#0066ff';
    ctx.fillRect(20, height - 45, 20, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Champ magnétique B (T)', 50, height - 37);
    
    // Valeurs numériques avec fond
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(width - 250, height - 80, 240, 70);
    
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px Arial';
    const E_magnitude = Math.sqrt(E.x*E.x + E.y*E.y + E.z*E.z);
    const B_magnitude = Math.sqrt(B.x*B.x + B.y*B.y + B.z*B.z);
    ctx.fillText(`|E| = ${E_magnitude.toFixed(1)} V/m`, width - 240, height - 55);
    ctx.fillText(`|B| = ${(B_magnitude*1e9).toFixed(1)} nT`, width - 240, height - 35);
    
    // Ratio E/B
    if (B_magnitude > 0) {
      const ratio = E_magnitude / B_magnitude;
      ctx.fillText(`E/B = ${(ratio/1e8).toFixed(1)}×10⁸ m/s`, width - 240, height - 15);
    }
  };

  const loadExample = (exampleType) => {
    // Constante pour les exemples
    const E0_TD = 1000; // V/m pour f = 2.5 GHz
    const E0_laser = 868; // V/m calculé pour laser He-Ne (P=1mW, S=1mm²)
    const B0_demo = 3e-6; // T = 3 μT (valeur typique correspondant à E0_TD)
    
    if (exampleType === 'exemple1') {
      // Exemple 1: E⃗ = E₀ û_z, propagation selon X → B calculé
      setFieldEquations({
        Ex: '0',
        Ey: '0', 
        Ez: E0_TD.toString(),
        Bx: '0',
        By: '0',
        Bz: '0'
      });
      setPropagationAxis('x');
      setInputMode('electric');
      
    } else if (exampleType === 'exemple2') {
      // Exemple 2: E⃗ = E₀ û_x, propagation selon Y → B calculé
      setFieldEquations({
        Ex: E0_TD.toString(),
        Ey: '0',
        Ez: '0',
        Bx: '0',
        By: '0',
        Bz: '0'
      });
      setPropagationAxis('y');
      setInputMode('electric');
      
    } else if (exampleType === 'exemple3') {
      // Exemple 3: E⃗ = E₀ û_x, propagation selon Z → B calculé
      setFieldEquations({
        Ex: E0_TD.toString(),
        Ey: '0',
        Ez: '0',
        Bx: '0',
        By: '0',
        Bz: '0'
      });
      setPropagationAxis('z');
      setInputMode('electric');
      
    } else if (exampleType === 'exemple4') {
      // Exemple 4: E⃗ = E₀ û_y, propagation selon X → B calculé
      setFieldEquations({
        Ex: '0',
        Ey: E0_TD.toString(),
        Ez: '0',
        Bx: '0',
        By: '0',
        Bz: '0'
      });
      setPropagationAxis('x');
      setInputMode('electric');
      
    } else if (exampleType === 'exemple5') {
      // Exemple 5: Laser Hélium-Néon réaliste
      setFieldEquations({
        Ex: E0_laser.toString(),
        Ey: '0',
        Ez: '0',
        Bx: '0',
        By: '0',
        Bz: '0'
      });
      setPropagationAxis('z');
      setInputMode('electric');
      
    } else if (exampleType === 'exemple6') {
      // Exemple 6: Champ B donné → E calculé
      setFieldEquations({
        Ex: '0',
        Ey: '0',
        Ez: '0',
        Bx: '0',
        By: B0_demo.toString(),
        Bz: '0'
      });
      setPropagationAxis('z');
      setInputMode('magnetic');
      
    } else if (exampleType === 'simple_ex') {
      setFieldEquations({
        Ex: '1.0',
        Ey: '0',
        Ez: '0',
        Bx: '0',
        By: '0',
        Bz: '0'
      });
      setPropagationAxis('z');
      setInputMode('electric');
    } else if (exampleType === 'simple_ey') {
      setFieldEquations({
        Ex: '0',
        Ey: '2.0', 
        Ez: '0',
        Bx: '0',
        By: '0',
        Bz: '0'
      });
      setPropagationAxis('x');
      setInputMode('electric');
    } else if (exampleType === 'combined') {
      setFieldEquations({
        Ex: '1.0',
        Ey: '1.0',
        Ez: '0',
        Bx: '0',
        By: '0',
        Bz: '0'
      });
      setPropagationAxis('z');
      setInputMode('electric');
    } else if (exampleType === 'magnetic_demo') {
      setFieldEquations({
        Ex: '0',
        Ey: '0',
        Ez: '0',
        Bx: '3e-9',
        By: '0',
        Bz: '0'
      });
      setPropagationAxis('y');
      setInputMode('magnetic');
    }
  };

  // Fonctions pour les exemples personnalisés
  const saveCustomExample = () => {
    if (!newExample.name.trim()) {
      alert('Veuillez entrer un nom pour l\'exemple');
      return;
    }

    const example = {
      id: Date.now(),
      name: newExample.name,
      description: newExample.description,
      fields: {
        Ex: newExample.Ex, Ey: newExample.Ey, Ez: newExample.Ez,
        Bx: newExample.Bx, By: newExample.By, Bz: newExample.Bz
      },
      propagationAxis: newExample.propagationAxis,
      inputMode: newExample.inputMode,
      createdAt: new Date().toLocaleString()
    };

    setCustomExamples(prev => [...prev, example]);
    
    // Reset le formulaire
    setNewExample({
      name: '',
      description: '',
      Ex: '0', Ey: '0', Ez: '0',
      Bx: '0', By: '0', Bz: '0',
      propagationAxis: 'z',
      inputMode: 'electric'
    });
    
    alert(`Exemple "${example.name}" sauvegardé !`);
  };

  const loadCustomExample = (example) => {
    setFieldEquations(example.fields);
    setPropagationAxis(example.propagationAxis);
    setInputMode(example.inputMode);
  };

  const deleteCustomExample = (id) => {
    setCustomExamples(prev => prev.filter(ex => ex.id !== id));
  };

  const loadTDTemplate = (template) => {
    const E0_TD = 1000;
    const E0_laser = 868;
    const B0_demo = 3e-6;
    
    const templates = {
      'exemple1': { Ex: 0, Ey: 0, Ez: E0_TD, axis: 'x', mode: 'electric' },
      'exemple2': { Ex: E0_TD, Ey: 0, Ez: 0, axis: 'y', mode: 'electric' },
      'exemple3': { Ex: E0_TD, Ey: 0, Ez: 0, axis: 'z', mode: 'electric' },
      'exemple5': { Ex: E0_laser, Ey: 0, Ez: 0, axis: 'z', mode: 'electric' },
      'exemple6': { Bx: 0, By: B0_demo, Bz: 0, axis: 'z', mode: 'magnetic' }
    };
    
    const t = templates[template];
    if (t.mode === 'electric') {
      setNewExample(prev => ({
        ...prev,
        Ex: t.Ex.toString(), Ey: t.Ey.toString(), Ez: t.Ez.toString(),
        Bx: '0', By: '0', Bz: '0',
        propagationAxis: t.axis,
        inputMode: t.mode
      }));
    } else {
      setNewExample(prev => ({
        ...prev,
        Ex: '0', Ey: '0', Ez: '0',
        Bx: t.Bx.toString(), By: t.By.toString(), Bz: t.Bz.toString(),
        propagationAxis: t.axis,
        inputMode: t.mode
      }));
    }
  };

  useEffect(() => {
    if (inputMode === 'electric') {
      calculateMagneticFromElectric();
    } else {
      calculateElectricFromMagnetic();
    }
    analyzeWaveProperties();
  }, [fieldEquations, parameters, propagationAxis, inputMode]);

  useEffect(() => {
    const interval = setInterval(renderVisualization, 100);
    return () => clearInterval(interval);
  }, [calculatedFields, parameters, inputMode, propagationAxis, fieldEquations, visualizationControls]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Calculateur de Champs Électromagnétiques
          </h1>
          <p className="text-gray-300">Visualisation des champs E⃗ et B⃗ - Exemples basés sur le TD LSPh411N</p>
          <p className="text-sm text-gray-400 mt-1">UVSQ - UFR des Sciences - f = 2.5 GHz</p>
        </div>

        {/* Module créateur d'exemples personnalisés */}
        <div className="mb-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-purple-500">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-purple-400">🎨 Créateur d'exemples personnalisés</h3>
            <button
              onClick={() => setShowCustomCreator(!showCustomCreator)}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm"
            >
              {showCustomCreator ? 'Masquer' : 'Créer nouvel exemple'}
            </button>
          </div>

          {showCustomCreator && (
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom de l'exemple</label>
                  <input
                    type="text"
                    value={newExample.name}
                    onChange={(e) => setNewExample(prev => ({...prev, name: e.target.value}))}
                    placeholder="Mon onde personnalisée"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (optionelle)</label>
                  <input
                    type="text"
                    value={newExample.description}
                    onChange={(e) => setNewExample(prev => ({...prev, description: e.target.value}))}
                    placeholder="Description de votre onde"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-yellow-400">Templates basés sur les exemples (valeurs préremplies)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    onClick={() => loadTDTemplate('exemple1')}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                  >
                    Exemple 1 (Ez→X)
                  </button>
                  <button
                    onClick={() => loadTDTemplate('exemple2')}
                    className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-xs"
                  >
                    Exemple 2 (Ex→Y)
                  </button>
                  <button
                    onClick={() => loadTDTemplate('exemple3')}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
                  >
                    Exemple 3 (Ex→Z)
                  </button>
                  <button
                    onClick={() => loadTDTemplate('exemple5')}
                    className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs"
                  >
                    Exemple 5 (Laser)
                  </button>
                  <button
                    onClick={() => loadTDTemplate('exemple6')}
                    className="bg-pink-600 hover:bg-pink-700 px-3 py-1 rounded text-xs"
                  >
                    Exemple 6 (B→E)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type de champ</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="electric"
                        checked={newExample.inputMode === 'electric'}
                        onChange={(e) => setNewExample(prev => ({...prev, inputMode: e.target.value}))}
                        className="mr-2"
                      />
                      <Zap size={16} className="mr-1" />
                      Champ E
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="magnetic"
                        checked={newExample.inputMode === 'magnetic'}
                        onChange={(e) => setNewExample(prev => ({...prev, inputMode: e.target.value}))}
                        className="mr-2"
                      />
                      <Waves size={16} className="mr-1" />
                      Champ B
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Direction de propagation</label>
                  <select 
                    value={newExample.propagationAxis}
                    onChange={(e) => setNewExample(prev => ({...prev, propagationAxis: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  >
                    <option value="x">Axe X (vers la droite)</option>
                    <option value="y">Axe Y (vers le haut)</option>
                    <option value="z">Axe Z (vers nous)</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">
                  {newExample.inputMode === 'electric' ? 'Composantes du champ électrique (V/m)' : 'Composantes du champ magnétique (T)'}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {['x', 'y', 'z'].map(component => {
                    const field = newExample.inputMode === 'electric' ? `E${component}` : `B${component}`;
                    return (
                      <div key={component}>
                        <label className="block text-xs font-medium mb-1">{field} =</label>
                        <input
                          type="text"
                          value={newExample[field]}
                          onChange={(e) => setNewExample(prev => ({...prev, [field]: e.target.value}))}
                          placeholder={newExample.inputMode === 'electric' ? '1000' : '3e-9'}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm font-mono"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={saveCustomExample}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center"
              >
                <Calculator className="mr-2" size={16} />
                Sauvegarder cet exemple
              </button>
            </div>
          )}

          {/* Liste des exemples personnalisés sauvegardés */}
          {customExamples.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-3 text-green-400">📚 Vos exemples sauvegardés</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {customExamples.map(example => (
                  <div key={example.id} className="bg-gray-800 rounded p-3 border border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-white truncate">{example.name}</h5>
                      <button
                        onClick={() => deleteCustomExample(example.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    {example.description && (
                      <p className="text-xs text-gray-400 mb-2">{example.description}</p>
                    )}
                    <div className="text-xs text-gray-300 mb-2">
                      <div>Mode: {example.inputMode === 'electric' ? 'E⃗' : 'B⃗'} → {example.propagationAxis.toUpperCase()}</div>
                      <div>Créé: {example.createdAt}</div>
                    </div>
                    <button
                      onClick={() => loadCustomExample(example)}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs w-full"
                    >
                      Charger cet exemple
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Exemples basés sur le TD LSPh411N</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => loadExample('exemple1')}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm"
            >
              Exemple 1: Ez → X
            </button>
            <button
              onClick={() => loadExample('exemple2')} 
              className="bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded text-sm"
            >
              Exemple 2: Ex → Y
            </button>
            <button
              onClick={() => loadExample('exemple3')}
              className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
            >
              Exemple 3: Ex → Z
            </button>
            <button
              onClick={() => loadExample('exemple4')}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
            >
              Exemple 4: Ey → X
            </button>
            <button
              onClick={() => loadExample('exemple5')}
              className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm"
            >
              Exemple 5: Laser He-Ne
            </button>
            <button
              onClick={() => loadExample('exemple6')}
              className="bg-pink-600 hover:bg-pink-700 px-3 py-2 rounded text-sm"
            >
              Exemple 6: Champ B donné
            </button>
          </div>
          <div className="mt-3 text-sm text-gray-400">
            <strong>Principe:</strong> Si E⃗ donné → B⃗ calculé | Si B⃗ donné → E⃗ calculé | E₀ = 1000 V/m (f = 2.5 GHz)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="mr-2" size={20} />
              Configuration
            </h2>
            
            <div className="mb-6 bg-gray-700 rounded p-3">
              <h4 className="text-sm font-medium mb-2 text-yellow-400">Paramètres du TD LSPh411N</h4>
              <div className="text-xs text-gray-300 space-y-1">
                <div>f = 2.5 GHz (TD 2a.4)</div>
                <div>ω = {CONSTANTS.omega.toExponential(1)} rad/s</div>
                <div>k = {parameters.k.toExponential(1)} rad/m</div>
                <div>λ = {(2*Math.PI*CONSTANTS.c/CONSTANTS.omega*1e3).toFixed(1)} mm</div>
                <div>c = {CONSTANTS.c.toExponential(2)} m/s</div>
                <div>Z₀ = {CONSTANTS.Z0.toFixed(1)} Ω</div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Champ donné</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="inputMode"
                    value="electric"
                    checked={inputMode === 'electric'}
                    onChange={(e) => setInputMode(e.target.value)}
                    className="mr-2"
                  />
                  <Zap size={16} className="mr-1" />
                  Champ E
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="inputMode"
                    value="magnetic"
                    checked={inputMode === 'magnetic'}
                    onChange={(e) => setInputMode(e.target.value)}
                    className="mr-2"
                  />
                  <Waves size={16} className="mr-1" />
                  Champ B
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Direction de propagation k</label>
              <select 
                value={propagationAxis}
                onChange={(e) => setPropagationAxis(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                <option value="x">Axe X (vers la droite)</option>
                <option value="y">Axe Y (vers le haut)</option>
                <option value="z">Axe Z (vers nous)</option>
              </select>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">
                {inputMode === 'electric' ? 'Champ électrique E (V/m)' : 'Champ magnétique B (T)'}
              </h3>
              <div className="space-y-3">
                {['x', 'y', 'z'].map(component => {
                  const field = inputMode === 'electric' ? `E${component}` : `B${component}`;
                  return (
                    <div key={component}>
                      <label className="block text-sm font-medium mb-1">
                        {field} =
                      </label>
                      <input
                        type="text"
                        value={fieldEquations[field]}
                        onChange={(e) => setFieldEquations(prev => ({
                          ...prev,
                          [field]: e.target.value
                        }))}
                        placeholder={inputMode === 'electric' ? "ex: 1.0" : "ex: 3e-9"}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm font-mono"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-900 bg-opacity-30 rounded p-3 text-sm">
              <h4 className="font-medium mb-2">Guide des valeurs des exemples :</h4>
              <div className="text-xs space-y-1">
                <div>• <strong>E₀ standard:</strong> 1000 V/m (exemples 1-4)</div>
                <div>• <strong>Laser He-Ne:</strong> 868 V/m (exemple 5)</div>
                <div>• <strong>Champ B donné:</strong> 3 μT (exemple 6)</div>
                <div>• <strong>Relation:</strong> |B| = |E|/c ≈ |E|/(3×10⁸)</div>
                <div>• <strong>Créez vos exemples</strong> avec le module ci-dessus ⬆️</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Visualisation des champs E et B</h2>
              <button
                onClick={renderVisualization}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center"
              >
                <Calculator className="mr-2" size={16} />
                Actualiser
              </button>
            </div>

            {/* Contrôles de visualisation du champ magnétique */}
            <div className="mb-4 bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 text-cyan-400">🎛️ Contrôles de visualisation du champ magnétique</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Échelle B (multiplicateur)</label>
                  <select 
                    value={visualizationControls.magneticScale}
                    onChange={(e) => setVisualizationControls(prev => ({...prev, magneticScale: parseFloat(e.target.value)}))}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-xs"
                  >
                    <option value={1e9}>×10⁹ (standard)</option>
                    <option value={1e10}>×10¹⁰ (plus visible)</option>
                    <option value={1e11}>×10¹¹ (très visible)</option>
                    <option value={1e12}>×10¹² (maximum)</option>
                    <option value={5e11}>×5×10¹¹ (intermédiaire)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1">Épaisseur B</label>
                  <select 
                    value={visualizationControls.magneticThickness}
                    onChange={(e) => setVisualizationControls(prev => ({...prev, magneticThickness: parseInt(e.target.value)}))}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-xs"
                  >
                    <option value={3}>Fine (3px)</option>
                    <option value={6}>Normale (6px)</option>
                    <option value={8}>Épaisse (8px)</option>
                    <option value={10}>Très épaisse (10px)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={visualizationControls.showMagneticField}
                      onChange={(e) => setVisualizationControls(prev => ({...prev, showMagneticField: e.target.checked}))}
                      className="mr-1"
                    />
                    Afficher B
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={visualizationControls.showElectricField}
                      onChange={(e) => setVisualizationControls(prev => ({...prev, showElectricField: e.target.checked}))}
                      className="mr-1"
                    />
                    Afficher E
                  </label>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                💡 Augmentez l'échelle B si les flèches bleues sont trop petites. Le champ B est ~10⁶ fois plus petit que E !
              </div>
            </div>
            
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <canvas
                ref={canvasRef}
                width={700}
                height={500}
                className="w-full max-w-full"
              />
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <ArrowRight className="mr-2" size={16} />
                {inputMode === 'electric' ? 'Champ magnétique B calculé (T)' : 'Champ électrique E calculé (V/m)'}
              </h3>
              <div className="grid grid-cols-3 gap-2 text-sm font-mono">
                {['x', 'y', 'z'].map(component => {
                  const field = inputMode === 'electric' ? `B${component}` : `E${component}`;
                  const value = calculatedFields[field] || '0';
                  return (
                    <div key={component} className="bg-gray-800 rounded px-3 py-2">
                      <span className="text-gray-300">{field} = </span>
                      <span className="text-green-400">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Info className="mr-2" size={18} />
              Propriétés de l'onde
            </h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Fréquence :</span>
                  <span className="ml-2 text-blue-400">{waveProperties.frequency.toExponential(2)} Hz</span>
                </div>
                <div>
                  <span className="font-medium">Longueur d'onde :</span>
                  <span className="ml-2 text-green-400">{waveProperties.wavelength.toExponential(2)} m</span>
                </div>
                <div>
                  <span className="font-medium">Période :</span>
                  <span className="ml-2 text-yellow-400">{waveProperties.period.toExponential(2)} s</span>
                </div>
                <div>
                  <span className="font-medium">Vitesse :</span>
                  <span className="ml-2 text-purple-400">{waveProperties.phase_velocity.toExponential(2)} m/s</span>
                </div>
              </div>
              <div>
                <span className="font-medium">Densité d'énergie :</span>
                <span className="ml-2 text-cyan-400">{waveProperties.energy_density.toExponential(2)} J/m³</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Analyse</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Relation :</span>
                <span className="ml-2 text-green-400">B = (k × E) / ω</span>
              </div>
              <div>
                <span className="font-medium">Polarisation :</span>
                <span className="ml-2 text-blue-400">{results.polarization}</span>
              </div>
              <div>
                <span className="font-medium">Direction :</span>
                <span className="ml-2 text-purple-400">{results.direction}</span>
              </div>
              <p className="text-gray-300 mt-3">{results.analysis}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Description des exemples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-3 text-blue-400">Exemples avec champ E donné</h4>
              <div className="space-y-2 text-gray-300">
                <div><strong>Exemple 1:</strong> E⃗ = 1000 û_z V/m, propagation → X</div>
                <div><strong>Exemple 2:</strong> E⃗ = 1000 û_x V/m, propagation → Y</div>
                <div><strong>Exemple 3:</strong> E⃗ = 1000 û_x V/m, propagation → Z</div>
                <div><strong>Exemple 4:</strong> E⃗ = 1000 û_y V/m, propagation → X</div>
                <div><strong>Exemple 5:</strong> E⃗ = 868 û_x V/m (Laser He-Ne réaliste)</div>
                <div>→ <em>Le champ B⃗ est calculé automatiquement</em></div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-green-400">Exemple avec champ B donné</h4>
              <div className="space-y-2 text-gray-300">
                <div><strong>Exemple 6:</strong> B⃗ = 3 û_y μT, propagation → Z</div>
                <div>→ <em>Le champ E⃗ est calculé automatiquement</em></div>
                <div className="mt-4 space-y-1">
                  <div><strong>Relation fondamentale:</strong></div>
                  <div>B⃗ = (k⃗ × E⃗) / ω</div>
                  <div>|B| = |E| / c ≈ |E| / (3×10⁸)</div>
                  <div>E⃗ ⟂ B⃗ ⟂ k⃗ (perpendiculaires)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-purple-900 to-gray-800 rounded-lg p-6 border border-purple-500">
          <h3 className="text-lg font-semibold mb-4 text-purple-400">🎨 Guide d'utilisation du créateur d'exemples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-3 text-yellow-400">Comment créer votre exemple</h4>
              <div className="space-y-2 text-gray-300">
                <div><strong>1.</strong> Cliquez sur "Créer nouvel exemple"</div>
                <div><strong>2.</strong> Utilisez un template du TD ou partez de zéro</div>
                <div><strong>3.</strong> Donnez un nom à votre configuration</div>
                <div><strong>4.</strong> Ajustez les valeurs des champs</div>
                <div><strong>5.</strong> Choisissez la direction de propagation</div>
                <div><strong>6.</strong> Sauvegardez pour réutiliser plus tard</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-cyan-400">Templates disponibles</h4>
              <div className="space-y-2 text-gray-300">
                <div><strong>Exemple 1:</strong> Ez = 1000 V/m → X</div>
                <div><strong>Exemple 2:</strong> Ex = 1000 V/m → Y</div>
                <div><strong>Exemple 3:</strong> Ex = 1000 V/m → Z</div>
                <div><strong>Exemple 5:</strong> Ex = 868 V/m (Laser réaliste)</div>
                <div><strong>Exemple 6:</strong> By = 3 μT → Z (champ B donné)</div>
                <div><strong>Vos créations</strong> sont sauvegardées automatiquement</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Comprendre la visualisation améliorée</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-red-900 bg-opacity-30 rounded p-4 border border-red-500">
              <h4 className="font-medium mb-2 text-red-400">🔴 Zone CHAMP E (gauche)</h4>
              <div className="space-y-1 text-gray-300">
                <div>• <strong>Flèches rouges épaisses</strong> = direction E⃗</div>
                <div>• <strong>Longueur</strong> = amplitude en V/m</div>
                <div>• <strong>Labels</strong> : Ex, Ey, Ez avec valeurs</div>
                <div>• <strong>Zone rouge translucide</strong> pour identification</div>
              </div>
            </div>
            <div className="bg-blue-900 bg-opacity-30 rounded p-4 border border-blue-500">
              <h4 className="font-medium mb-2 text-blue-400">🔵 Zone CHAMP B (droite)</h4>
              <div className="space-y-1 text-gray-300">
                <div>• <strong>Flèches bleues très épaisses</strong> = direction B⃗</div>
                <div>• <strong>Échelle ×10¹²</strong> pour rendre B visible !</div>
                <div>• <strong>Labels</strong> : Bx, By, Bz avec valeurs</div>
                <div>• <strong>Zone bleue translucide</strong> pour identification</div>
              </div>
            </div>
            <div className="bg-green-900 bg-opacity-30 rounded p-4 border border-green-500">
              <h4 className="font-medium mb-2 text-green-400">⚙️ Contrôles avancés</h4>
              <div className="space-y-1 text-gray-300">
                <div>• <strong>Échelle B</strong> : Ajustez de ×10⁹ à ×10¹²</div>
                <div>• <strong>Épaisseur</strong> : Flèches de 3px à 10px</div>
                <div>• <strong>Affichage</strong> : Activez/désactivez E ou B</div>
                <div>• <strong>Ratio E/B</strong> affiché = vitesse lumière</div>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-yellow-900 bg-opacity-20 rounded p-3 border border-yellow-600">
            <h4 className="font-medium text-yellow-400 mb-2">🔬 Pourquoi le champ B semble si petit ?</h4>
            <div className="text-sm text-gray-300">
              <strong>C'est physique !</strong> Pour une onde EM : |B| = |E|/c ≈ |E|/(3×10⁸). 
              Donc si E = 1000 V/m → B ≈ 3×10⁻⁶ T = 3 μT. 
              <strong>L'échelle ×10¹²</strong> permet de visualiser cette relation fondamentale !
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectromagneticFieldCalculator;