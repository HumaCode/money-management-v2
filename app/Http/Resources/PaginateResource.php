<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaginateResource extends JsonResource
{
    protected ?string $collectsClass = null;

    public function __construct($resource, ?string $collectsClass = null)
    {
        parent::__construct($resource);
        $this->collectsClass = $collectsClass;
    }

    public static function make(...$parameters)
    {
        return new static(...$parameters);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = $this->collectsClass 
            ? $this->collectsClass::collection($this->items())
            : $this->collect($this->items());

        return [
            'data' => $items,
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
