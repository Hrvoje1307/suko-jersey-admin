import type { PlayerSource, ProductPlayersFormValues } from '@/entities/product'

type PlayerLike = {
  id: number
  player_name: string
  player_number: string | null
  // Detalj proizvoda (available_players) ga nema; vraćaju ga samo endpointi za igrače.
  source?: PlayerSource
}

export function playersToFormValues(players: PlayerLike[]): ProductPlayersFormValues {
  return {
    players: players.map((player) => ({
      id: player.id,
      player_name: player.player_name,
      player_number: player.player_number ?? '',
      source: player.source ?? null,
    })),
  }
}
