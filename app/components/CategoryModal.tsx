import React, { FC } from 'react'

type Props = {
    name: string;
    description: string;
    loading: boolean;
    onclose: () => void;
    onChangeName: (value: string) => void;
    onChangeDescription: (value: string) => void;
    onsubmit: () => void;
    editMode: boolean;
}

const CategoryModal: FC<Props> = ({
    name,
    description,
    loading,
    onclose,
    onChangeName,
    onChangeDescription,
    onsubmit,
    editMode
}) => {
    return (
        <dialog id="category_modal" className="modal">
            <div className="modal-box">
                <form method="dialog">
                    <button
                        onClick={onclose}
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    >
                        X
                    </button>
                </form>
                <h3 className="font-bold text-lg mb-4">
                    {
                        editMode ? "Modifier la catégorie" : "Nouvelle catégorie"
                    }
                </h3>
                <input
                    type="text"
                    placeholder='Nom'
                    value={name}
                    onChange={(e) => onChangeName(e.target.value)}
                    className='input input-bordered w-full mb-4'
                />
                                <input
                    type="text"
                    placeholder='Description'
                    value={description}
                    onChange={(e) => onChangeDescription(e.target.value)}
                    className='input input-bordered w-full mb-4'
                />
                <button
                className='btn btn-primary'
                onClick={onsubmit}
                disabled={loading}
                >
                    {
                        loading ?
                        editMode ?
                        "Modification...":
                        "Ajout...":
                        editMode ?
                        "Modifier":
                        "Ajouter"
                    }
                </button>
            </div>
        </dialog>
    )
}

export default CategoryModal