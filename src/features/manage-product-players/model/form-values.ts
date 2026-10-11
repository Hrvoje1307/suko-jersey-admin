import type { ProductPlayer, ProductPlayersFormValues } from '@/entities/product'

export function playersToFormValues(players: ProductPlayer[]): ProductPlayersFormValues {
  return {
    players: players.map((player) => ({
      id: player.id,
      player_name: player.player_name,
      player_number: player.player_number ?? '',
    })),
  }
}
