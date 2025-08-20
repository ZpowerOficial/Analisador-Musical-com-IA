/**
 * Advanced Prompt Engineering Service
 * Implements sophisticated multi-layered prompts with specialized roles
 */

import type { ConsolidatedMusicData } from './geminiService';
import type { AudioAnalysisResult, LyricsExtractionResult } from './audioAnalysis.service';

export interface AnalysisPromptConfig {
  language: string;
  analysisDepth: 'basic' | 'advanced' | 'expert';
  specializations: string[];
  confidenceThreshold: number;
}

export interface ChainOfThoughtStep {
  step: number;
  specialist: string;
  reasoning: string;
  evidence: string[];
  confidence: number;
  next_steps: string[];
}

export interface PromptLayer {
  role: string;
  expertise: string;
  focus_areas: string[];
  analysis_framework: string;
  confidence_factors: string[];
}

class PromptEngineeringService {
  private readonly SPECIALIST_PROMPTS = {
    audio_engineer: {
      role: "Grammy-winning Audio Engineer & Producer",
      expertise: "25+ years in professional audio production, mixing, and mastering",
      credentials: "AES Fellow, NARAS Voting Member, Dolby Atmos Certified",
      tools: "Pro Tools HDX, SSL Console, Neve Hardware, Spectrum Analyzers",
      focus: "Technical audio analysis, production quality assessment, sonic characteristics"
    },
    musicologist: {
      role: "PhD Musicologist & Music Theorist",
      expertise: "Harvard/Juilliard education, specializing in popular music studies",
      credentials: "Published researcher, peer-reviewed journals, conference speaker",
      frameworks: "Schenkerian Analysis, Neo-Riemannian Theory, Cultural Musicology",
      focus: "Theoretical analysis, historical context, cultural significance"
    },
    lyricist_analyst: {
      role: "Professional Songwriter & Literary Analyst",
      expertise: "Billboard charting songwriter with linguistics PhD",
      credentials: "ASCAP member, published poet, vocal delivery specialist",
      methods: "Phonetic analysis, prosodic analysis, semantic interpretation",
      focus: "Lyrical content, poetic devices, vocal delivery, narrative structure"
    },
    genre_specialist: {
      role: "Multi-Genre Music Curator & Trend Analyst",
      expertise: "20+ years in music industry, A&R experience, cultural anthropology",
      credentials: "Music industry executive, cultural researcher, trend forecaster",
      knowledge: "Regional scenes, genre evolution, fusion movements, emerging trends",
      focus: "Genre classification, cultural movements, cross-genre influences"
    }
  };

  /**
   * Generate advanced multi-layered prompt with chain-of-thought reasoning
   */
  generateAdvancedPrompt(
    data: ConsolidatedMusicData,
    audioAnalysis: AudioAnalysisResult,
    lyricsAnalysis: LyricsExtractionResult,
    config: AnalysisPromptConfig
  ): string {
    const langConfig = this.getLanguageConfig(config.language);
    const specialists = this.selectSpecialists(config.specializations);
    
    return this.buildMultiLayeredPrompt(data, audioAnalysis, lyricsAnalysis, langConfig, specialists, config);
  }

  /**
   * Create chain-of-thought reasoning structure
   */
  generateChainOfThought(
    data: ConsolidatedMusicData,
    audioAnalysis: AudioAnalysisResult,
    lyricsExtraction: LyricsExtractionResult,
    specialists: string[]
  ): ChainOfThoughtStep[] {
    const steps: ChainOfThoughtStep[] = [];
    
    // Step 1: Initial Audio Assessment
    steps.push({
      step: 1,
      specialist: "Audio Engineer",
      reasoning: "Analyze technical audio characteristics and production quality",
      evidence: [
        `Dynamic range: ${audioAnalysis.features.dynamic.dynamic_range}dB`,
        `Loudness: ${audioAnalysis.features.dynamic.loudness_lufs} LUFS`,
        `Stereo width: ${(audioAnalysis.features.production.stereo_width * 100).toFixed(1)}%`
      ],
      confidence: audioAnalysis.confidence_scores.production,
      next_steps: ["Harmonic analysis", "Rhythmic assessment"]
    });

    // Step 2: Musical Theory Analysis
    steps.push({
      step: 2,
      specialist: "Musicologist",
      reasoning: "Apply music theory frameworks to understand harmonic and structural elements",
      evidence: [
        `Key: ${audioAnalysis.features.key.key} ${audioAnalysis.features.key.mode}`,
        `Tempo: ${audioAnalysis.features.tempo.bpm.toFixed(1)} BPM`,
        `Harmonic complexity: ${audioAnalysis.features.harmonic.harmonic_complexity.toFixed(2)}`
      ],
      confidence: audioAnalysis.confidence_scores.harmonic,
      next_steps: ["Genre classification", "Cultural context analysis"]
    });

    // Step 3: Lyrical and Vocal Analysis
    steps.push({
      step: 3,
      specialist: "Lyricist Analyst",
      reasoning: "Examine vocal delivery, lyrical content, and phonetic characteristics",
      evidence: [
        `Vocal range: ${lyricsExtraction.vocal_characteristics.pitch_range.min}-${lyricsExtraction.vocal_characteristics.pitch_range.max}Hz`,
        `Articulation clarity: ${(lyricsExtraction.vocal_characteristics.articulation_clarity * 100).toFixed(1)}%`,
        `Speech rate: ${lyricsExtraction.phonetic_analysis.speech_rate} words/min`
      ],
      confidence: lyricsExtraction.confidence,
      next_steps: ["Genre synthesis", "Final assessment"]
    });

    // Step 4: Genre and Cultural Synthesis
    steps.push({
      step: 4,
      specialist: "Genre Specialist",
      reasoning: "Synthesize all analyses to determine genre, cultural context, and significance",
      evidence: [
        `Audio quality: ${audioAnalysis.audio_quality}`,
        `Analysis methods: ${audioAnalysis.analysis_methods.join(', ')}`,
        `Overall confidence: ${(audioAnalysis.confidence_scores.overall * 100).toFixed(1)}%`
      ],
      confidence: audioAnalysis.confidence_scores.overall,
      next_steps: ["Final report generation"]
    });

    return steps;
  }

  private buildMultiLayeredPrompt(
    data: ConsolidatedMusicData,
    audioAnalysis: AudioAnalysisResult,
    lyricsAnalysis: LyricsExtractionResult,
    langConfig: any,
    specialists: any[],
    config: AnalysisPromptConfig
  ): string {
    const chainOfThought = this.generateChainOfThought(data, audioAnalysis, lyricsAnalysis, specialists.map(s => s.role));
    
    return `
# ADVANCED MUSICAL ANALYSIS SYSTEM
## Multi-Specialist AI Consortium with Chain-of-Thought Reasoning

**LANGUAGE**: ${langConfig.instruction}
**ANALYSIS DEPTH**: ${config.analysisDepth.toUpperCase()}
**CONFIDENCE THRESHOLD**: ${config.confidenceThreshold}

---

## SPECIALIST TEAM ASSEMBLY

${specialists.map(specialist => `
### ${specialist.role}
- **Expertise**: ${specialist.expertise}
- **Credentials**: ${specialist.credentials}
- **Focus**: ${specialist.focus}
- **Tools/Methods**: ${specialist.tools || specialist.frameworks || specialist.methods || specialist.knowledge}
`).join('')}

---

## AUDIO ANALYSIS DATA (Technical Foundation)

### Technical Audio Features
- **Tempo**: ${audioAnalysis.features.tempo.bpm.toFixed(1)} BPM (confidence: ${(audioAnalysis.features.tempo.confidence * 100).toFixed(1)}%)
- **Key**: ${audioAnalysis.features.key.key} ${audioAnalysis.features.key.mode} (confidence: ${(audioAnalysis.features.key.confidence * 100).toFixed(1)}%)
- **Dynamic Range**: ${audioAnalysis.features.dynamic.dynamic_range.toFixed(1)}dB
- **Loudness**: ${audioAnalysis.features.dynamic.loudness_lufs.toFixed(1)} LUFS
- **Stereo Width**: ${(audioAnalysis.features.production.stereo_width * 100).toFixed(1)}%
- **Audio Quality**: ${audioAnalysis.audio_quality}

### Spectral Characteristics
- **Spectral Centroid**: ${audioAnalysis.features.spectral.spectral_centroid.toFixed(0)}Hz
- **Spectral Rolloff**: ${audioAnalysis.features.spectral.spectral_rolloff.toFixed(0)}Hz
- **Zero Crossing Rate**: ${audioAnalysis.features.spectral.zero_crossing_rate.toFixed(3)}

### Harmonic Analysis
- **Harmonic Ratio**: ${audioAnalysis.features.harmonic.harmonic_ratio.toFixed(2)}
- **Chord Changes/Min**: ${audioAnalysis.features.harmonic.chord_changes_per_minute.toFixed(1)}
- **Harmonic Complexity**: ${audioAnalysis.features.harmonic.harmonic_complexity.toFixed(2)}/10

### Rhythmic Features
- **Beat Strength**: ${audioAnalysis.features.rhythmic.beat_strength.toFixed(2)}
- **Rhythmic Regularity**: ${audioAnalysis.features.rhythmic.rhythmic_regularity.toFixed(2)}
- **Syncopation Level**: ${audioAnalysis.features.rhythmic.syncopation_level.toFixed(1)}/10

---

## VOCAL & LYRICAL ANALYSIS DATA

### Vocal Characteristics
- **Pitch Range**: ${lyricsAnalysis.vocal_characteristics.pitch_range.min}-${lyricsAnalysis.vocal_characteristics.pitch_range.max}Hz
- **Vocal Style**: ${lyricsAnalysis.vocal_characteristics.vocal_style.join(', ')}
- **Articulation Clarity**: ${(lyricsAnalysis.vocal_characteristics.articulation_clarity * 100).toFixed(1)}%
- **Emotional Intensity**: ${(lyricsAnalysis.vocal_characteristics.emotional_intensity * 100).toFixed(1)}%

### Phonetic Analysis
- **Speech Rate**: ${lyricsAnalysis.phonetic_analysis.speech_rate} words/minute
- **Consonant Clarity**: ${(lyricsAnalysis.phonetic_analysis.consonant_clarity * 100).toFixed(1)}%
- **Prosodic Features**: ${lyricsAnalysis.phonetic_analysis.prosodic_features.join(', ')}

### Lyrics Extraction
- **Method**: ${lyricsAnalysis.method}
- **Confidence**: ${(lyricsAnalysis.confidence * 100).toFixed(1)}%

---

## CHAIN-OF-THOUGHT REASONING FRAMEWORK

${chainOfThought.map(step => `
### Step ${step.step}: ${step.specialist} Analysis
**Reasoning**: ${step.reasoning}
**Evidence**:
${step.evidence.map(e => `- ${e}`).join('\n')}
**Confidence**: ${(step.confidence * 100).toFixed(1)}%
**Next Steps**: ${step.next_steps.join(', ')}
`).join('')}

---

## ANALYSIS INSTRUCTIONS

Each specialist must:

1. **Apply your specific expertise** to the provided technical data
2. **Use chain-of-thought reasoning** following the framework above
3. **Provide confidence scores** for each analysis component (0-100%)
4. **Reference specific technical evidence** from the audio analysis data
5. **Acknowledge limitations** and uncertainty where appropriate
6. **Cross-reference findings** with other specialists' domains

### Audio Engineer Focus:
- Analyze production quality using LUFS, dynamic range, and spectral data
- Assess mixing techniques based on stereo width and frequency balance
- Evaluate mastering approach using compression and loudness metrics
- Provide technical confidence scores for each assessment

### Musicologist Focus:
- Apply music theory to harmonic and rhythmic analysis data
- Contextualize findings within historical and cultural frameworks
- Analyze structural elements using tempo and key information
- Provide theoretical confidence scores

### Lyricist Analyst Focus:
- Interpret vocal delivery using pitch range and articulation data
- Analyze phonetic characteristics and prosodic features
- Assess lyrical content based on extraction method and confidence
- Provide linguistic confidence scores

### Genre Specialist Focus:
- Synthesize all technical data for genre classification
- Assess cross-genre influences using spectral and rhythmic features
- Evaluate cultural significance based on production characteristics
- Provide genre confidence percentages

---

## OUTPUT REQUIREMENTS

**CRITICAL**: Respond in ${langConfig.name} using the JSON schema provided.
Include confidence scores (0-100%) for EVERY analysis component.
Reference specific technical data points in your reasoning.
Acknowledge analysis limitations transparently.

**CONFIDENCE SCORING GUIDELINES**:
- 90-100%: Extremely confident, multiple confirming evidence points
- 80-89%: Very confident, strong evidence with minor uncertainties
- 70-79%: Confident, good evidence with some limitations
- 60-69%: Moderately confident, mixed or limited evidence
- 50-59%: Low confidence, significant uncertainties
- Below 50%: Very uncertain, speculative analysis

**TRANSPARENCY REQUIREMENTS**:
- State which technical data points support each conclusion
- Acknowledge when analysis is based on AI knowledge vs. direct audio data
- Explain reasoning for confidence scores
- Note any conflicting evidence or alternative interpretations
`;
  }

  private getLanguageConfig(language: string) {
    const configs = {
      'pt-BR': {
        name: 'Português (Brasil)',
        instruction: 'Responda EXCLUSIVAMENTE em português brasileiro'
      },
      'en-US': {
        name: 'English (US)',
        instruction: 'Respond EXCLUSIVELY in English'
      }
      // Add other languages as needed
    };
    
    return configs[language as keyof typeof configs] || configs['en-US'];
  }

  private selectSpecialists(specializations: string[]) {
    return specializations.map(spec => this.SPECIALIST_PROMPTS[spec as keyof typeof this.SPECIALIST_PROMPTS])
      .filter(Boolean);
  }
}

export default PromptEngineeringService;
