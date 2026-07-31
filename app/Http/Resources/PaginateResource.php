<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaginateResource extends JsonResource
{
    protected ?string $collects;

    /**
     * Create a new resource instance.
     *
     * @param  mixed  $resource
     * @param  string|null  $collects
     * @return void
     */
    public function __construct($resource, ?string $collects = null)
    {
        parent::__construct($resource);
        $this->collects = $collects;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $collects = $this->collects;

        return [
            'data' => $collects ? $collects::collection($this->items()) : $this->collect($this->items()),
            'meta' => [
                'current_page'  => $this->currentPage(),
                'from'          => $this->firstItem(),
                'last_page'     => $this->lastPage(),
                'path'          => $this->path(),
                'per_page'      => $this->perPage(),
                'to'            => $this->lastItem(),
                'total'         => $this->total(),
            ]
        ];
    }
}
